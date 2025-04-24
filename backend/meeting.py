from flask import Flask, request, jsonify, redirect, url_for, session
import requests
import json
import os
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv, set_key
import google.oauth2.credentials
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import pickle
import groq  # Added for Groq AI integration
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import pandas as pd
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
app = Flask(__name__)
app.secret_key = os.urandom(24)  # Required for sessions

# Create .env file if it doesn't exist
if not os.path.exists('.env'):
    with open('.env', 'w') as f:
        f.write('')

# Load environment variables
load_dotenv()

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send',
    'https://mail.google.com/'  # More permissive Gmail scope
]

# Initialize Groq client
groq_client = groq.Client(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None

# Initialize Slack client
slack_token = os.getenv("SLACK_BOT_TOKEN")
slack_client = WebClient(token=slack_token) if slack_token else None

# Path to contacts CSV file - set this to your CSV file path
CONTACTS_CSV = os.getenv("CONTACTS_CSV", "contacts.csv")

def load_contacts():
    """
    Load contacts from CSV file into a dictionary
    Format: {name (lowercase): {'email': email, 'slack_id': slack_id}}
    """
    contacts = {}
    try:
        # Load the CSV file
        df = pd.read_csv(CONTACTS_CSV)
        
        # Check for required columns
        if 'name' in df.columns and 'email' in df.columns:
            # Convert to dictionary with lowercase names for case-insensitive matching
            for _, row in df.iterrows():
                name = row['name'].lower()
                contact_info = {'email': row['email']}
                
                # Add Slack ID if available
                if 'slack_id' in df.columns and not pd.isna(row.get('slack_id')):
                    contact_info['slack_id'] = row['slack_id']
                
                contacts[name] = contact_info
                
            print(f"Successfully loaded {len(contacts)} contacts from {CONTACTS_CSV}")
        else:
            print(f"Error: CSV file must have 'name' and 'email' columns")
    except Exception as e:
        print(f"Error loading contacts from CSV: {str(e)}")
    
    return contacts

def find_contact_by_partial_name(partial_name, contacts):
    """
    Find a contact by partial name matching
    Returns tuple of (full_name, contact_info) or (None, None) if no match found
    """
    if not partial_name:
        return None, None
        
    partial_name = partial_name.lower().strip()
    
    # First try exact match
    if partial_name in contacts:
        return partial_name, contacts[partial_name]
    
    # Then try partial match
    matches = []
    for name, contact_info in contacts.items():
        # Check if partial_name is contained within a full name
        if partial_name in name:
            matches.append((name, contact_info))
        # Check if partial_name is a nickname or abbreviated version (starts with)
        elif name.startswith(partial_name):
            matches.append((name, contact_info))
    
    # If we have exactly one match, return it
    if len(matches) == 1:
        return matches[0]
    # If we have multiple matches, log and return None
    elif len(matches) > 1:
        match_names = [m[0] for m in matches]
        print(f"Multiple matches found for '{partial_name}': {match_names}")
        return None, None
    else:
        print(f"No match found for '{partial_name}'")
        return None, None


@app.route('/create_bot', methods=['POST'])
def create_bot():
    data = request.get_json()

    external_api_url = 'https://api-meetstream-tst-hackathon.meetstream.ai/api/v1/bots/create_bot'
    
    headers = {
        'Authorization': 'ms_qRTMAkqSin2GmzYL7dWpxGIquSNwWwz1',
        'Content-Type': 'application/json'
    }

    response = requests.post(external_api_url, json=data, headers=headers)
    print("Status Code:", response.status_code)

    try:
        json_data = response.json()
        print("Response JSON:")
        print(json.dumps(json_data, indent=2))

        # Extract bot_id from response
        bot_id = json_data.get("bot_id")
        print("Bot ID from response:", bot_id)
        
        if bot_id:
            # Use dotenv's set_key function to update BOT_ID
            dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
            set_key(dotenv_path, "BOT_ID", bot_id)
            
            # Also update in current environment
            os.environ["BOT_ID"] = bot_id
            
            print(f"Updated bot_id to {bot_id} in .env file")
        else:
            print("Warning: No bot_id found in response")

        return jsonify(json_data), response.status_code

    except ValueError:
        print("Non-JSON response:", response.text)
        return jsonify({"error": "Invalid JSON response", "text": response.text}), 500


@app.route('/fetch_transcript', methods=['GET'])
def fetch_transcript():
    # Reload from .env to get latest BOT_ID
    load_dotenv()
    
    # Get bot_id from .env file
    bot_id = os.getenv('BOT_ID')
    
    if not bot_id:
        return jsonify({"error": "No bot ID found in .env file. Create a bot first."}), 400

    transcript_api_url = f'https://api-meetstream-tst-hackathon.meetstream.ai/api/v1/bots/{bot_id}/get_transcript'
    print(f"Using bot_id: {bot_id}")
    print(f"Requesting transcript from: {transcript_api_url}")

    headers = {
        'Authorization': 'ms_qRTMAkqSin2GmzYL7dWpxGIquSNwWwz1',
        'Content-Type': 'application/json'
    }

    response = requests.get(transcript_api_url, headers=headers)
    print("Transcript Status Code:", response.status_code)

    try:
        transcript_data = response.json()
        print("Transcript JSON:")
        print(json.dumps(transcript_data, indent=2))
        
        # Process transcript for scheduling intents and task assignments using Groq AI
        processing_results = process_transcript_with_groq(transcript_data)
        
        # Return transcript data along with processing results
        return jsonify({
            "transcript": transcript_data,
            "processing_results": processing_results,
            "has_google_credentials": os.path.exists('token.pickle'),
            "has_slack_integration": bool(slack_client),
        }), response.status_code
    except ValueError:
        print("Non-JSON response:", response.text)
        return jsonify({"error": "Invalid JSON response", "text": response.text}), 500
    
@app.route('/remove_bot', methods=['GET'])
def remove_bot():
    load_dotenv()
    
    # Get bot_id from .env file
    bot_id = os.getenv('BOT_ID')
    if not bot_id:
        return jsonify({"error": "No bot ID found in .env file. Create a bot first."}), 400
    
    removebot_api_url = f'https://api-meetstream-tst-hackathon.meetstream.ai/api/v1/bots/{bot_id}/remove_bot'
    print(f"Using bot_id: {bot_id}")
    print(f"Removing bot from: {removebot_api_url}")

    headers = {
        'Authorization': 'ms_qRTMAkqSin2GmzYL7dWpxGIquSNwWwz1',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get(removebot_api_url, headers=headers)
        print("Transcript Status Code:", response.status_code)

        if response.status_code == 200:
            return jsonify({"message": "Bot removed successfully!"}), 200
        else:
            return jsonify({
                "error": "Failed to remove bot.",
                "status_code": response.status_code,
                "details": response.text
            }), response.status_code

    except Exception as e:
        return jsonify({"error": "Exception occurred while removing bot", "details": str(e)}), 500


def process_transcript_with_groq(transcript_data):
    """
    Process transcript using Groq AI to detect scheduling intents and task assignments
    """
    if not groq_client:
        print("Groq client not initialized - skipping AI processing")
        return
        
    # Combine all transcript segments into a single text
    full_transcript = " ".join(
        segment.get("transcript", "") 
        for segment in transcript_data 
        if isinstance(segment, dict)
    )
    
    print(f"Processing transcript with Groq AI: {full_transcript[:200]}...")
    
    # Create a prompt for the AI to analyze the transcript
    prompt = f"""
    Analyze the following meeting transcript and extract:
    1. Any scheduling-related information
    2. Any task assignments to specific people

    Your response should be in JSON format with the following structure:
    {{
        "scheduling_intent": boolean,
        "event_title": string or null,
        "start_time": string (ISO format) or null,
        "end_time": string (ISO format) or null,
        "attendees": list of email addresses or empty list,
        "location": string or null,
        "notes": string or null,
        "task_assignments": [
            {{
                "assignee": string (person name),
                "task": string,
                "due_date": string (ISO format) or null
            }}
        ]
    }}
    
    Rules:
    1. Only set scheduling_intent to true if there's a clear intent to schedule a meeting
    2. For times, use the current date if only time is mentioned without a date
    3. Infer duration as 30 minutes if not specified
    4. Extract any mentions of tasks being assigned to specific people
    5. Extract names of people who are being assigned tasks, including nicknames or partial names
    
    Transcript:
    {full_transcript}
    """
    
    try:
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gemma2-9b-it",
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        # Parse the response
        response = json.loads(chat_completion.choices[0].message.content)
        print("Groq AI Response:", json.dumps(response, indent=2))
        
        results = {
            "scheduled_event": False,
            "assigned_tasks": []
        }
        
        # Handle scheduling intent
        if response.get("scheduling_intent"):
            try:
                # Get credentials but don't fail if not available
                creds = get_google_credentials()
                if not creds:
                    print("Warning: No valid Google credentials found. Calendar event cannot be created.")
                    print("Please visit /authorize_google to authorize access to Google Calendar")
                else:
                    # Only try to create calendar event if we have valid credentials
                    event_created = create_calendar_event(
                        summary=response.get("event_title", "Meeting from transcript"),
                        description=f"Automatically scheduled from transcript. Notes: {response.get('notes', '')}",
                        start_time=datetime.fromisoformat(response["start_time"]),
                        end_time=datetime.fromisoformat(response["end_time"]),
                        attendees=response.get("attendees", []),
                        location=response.get("location")
                    )
                    
                    if event_created:
                        results["scheduled_event"] = True
                        print("Successfully created calendar event from AI analysis")
                    else:
                        print("Failed to create calendar event")
            except Exception as e:
                print(f"Failed to create calendar event: {str(e)}")
        
        # Handle task assignments - this should run regardless of what happened with the calendar event
        if task_assignments := response.get("task_assignments", []):
            # Load contacts from your existing CSV file
            contacts = load_contacts()
            for assignment in task_assignments:
                assignee_partial_name = assignment.get("assignee", "").lower()
                task = assignment.get("task", "")
                due_date = assignment.get("due_date")
                
                task_result = {
                    "assignee": assignee_partial_name,
                    "task": task,
                    "email_sent": False,
                    "slack_sent": False
                }
                
                if assignee_partial_name and task:
                    # Find the contact using partial name matching
                    full_name, contact_info = find_contact_by_partial_name(assignee_partial_name, contacts)
                    
                    if contact_info:
                        # Send task via email if we have valid credentials
                        email = contact_info.get('email')
                        if email:
                            creds = get_google_credentials()
                            if creds:
                                try:
                                    email_sent = send_task_email(
                                        recipient_name=full_name,
                                        recipient_email=email,
                                        task=task,
                                        due_date=due_date
                                    )
                                    task_result["email_sent"] = email_sent
                                    if email_sent:
                                        print(f"Successfully sent task email to {full_name} (matched from '{assignee_partial_name}')")
                                except Exception as e:
                                    print(f"Failed to send email to {full_name}: {str(e)}")
                            else:
                                print(f"No valid Google credentials for sending email to {full_name}")
                        
                        # Send task via Slack if we have Slack ID - this is independent of Google credentials
                        slack_id = contact_info.get('slack_id')
                        if slack_id and slack_client:
                            try:
                                slack_sent = send_slack_message(
                                    slack_id=slack_id,
                                    recipient_name=full_name,
                                    task=task,
                                    due_date=due_date
                                )
                                task_result["slack_sent"] = slack_sent
                                if slack_sent:
                                    print(f"Successfully sent Slack message to {full_name} (Slack ID: {slack_id})")
                            except Exception as e:
                                print(f"Failed to send Slack message to {full_name}: {str(e)}")
                    else:
                        print(f"No matching contact found for '{assignee_partial_name}'")
                else:
                    print(f"Missing name or task in assignment: {assignment}")
                
                # Add this task result to our overall results
                results["assigned_tasks"].append(task_result)
        
        # Return summary of what happened
        print("Processing results:", json.dumps(results, indent=2))
        return results
                        
    except Exception as e:
        print(f"Error processing transcript with Groq: {str(e)}")
        return {"error": str(e)}


def send_slack_message(slack_id, recipient_name, task, due_date=None):
    """
    Send a Slack message to assign a task to someone
    """
    if not slack_client:
        print("No valid Slack client found")
        return False
    
    # Format the due date if provided
    due_date_str = ""
    if due_date:
        try:
            due_date_dt = datetime.fromisoformat(due_date)
            due_date_str = f"Due date: {due_date_dt.strftime('%A, %B %d, %Y')}"
        except:
            due_date_str = f"Due date: {due_date}"
    
    # Create the Slack message blocks
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"Hi {recipient_name.title()}, you've been assigned a new task from a meeting:"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Task:* {task}"
            }
        }
    ]
    
    # Add due date block if available
    if due_date_str:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*{due_date_str}*"
            }
        })
    
    # Add footer
    blocks.append({
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": "This task was automatically assigned based on a meeting transcript"
            }
        ]
    })
    
    try:
        # Send the message to the user
        response = slack_client.chat_postMessage(
            channel=slack_id,
            blocks=blocks,
            text=f"New task assignment: {task}"  # Fallback text for notifications
        )
        print(f"Slack message sent to {recipient_name} (ID: {slack_id}), timestamp: {response['ts']}")
        return True
    except SlackApiError as e:
        print(f"Error sending Slack message: {e.response['error']}")
        return False


def send_task_email(recipient_name, recipient_email, task, due_date=None):
    """
    Send an email to assign a task to someone
    """
    creds = get_google_credentials()
    if not creds:
        print("No valid Google credentials found")
        return False
    
    service = build('gmail', 'v1', credentials=creds)
    
    # Format the due date if provided
    due_date_str = ""
    if due_date:
        try:
            due_date_dt = datetime.fromisoformat(due_date)
            due_date_str = f"Due date: {due_date_dt.strftime('%A, %B %d, %Y')}"
        except:
            due_date_str = f"Due date: {due_date}"
    
    # Create the email content
    message = MIMEMultipart()
    message['to'] = recipient_email
    message['subject'] = f"Task Assignment: {task[:50]}{'...' if len(task) > 50 else ''}"
    
    # Format the email body
    body = f"""
    <html>
      <body>
        <p>Hi {recipient_name.title()},</p>
        <p>You've been assigned the following task:</p>
        <div style="padding: 10px; background-color: #f0f0f0; border-left: 4px solid #2196F3;">
          <p><strong>{task}</strong></p>
          {f"<p>{due_date_str}</p>" if due_date_str else ""}
        </div>
        <p>This task was automatically assigned based on a meeting transcript.</p>
        <p>Best regards,<br>MeetStream Assistant</p>
      </body>
    </html>
    """
    
    msg = MIMEText(body, 'html')
    message.attach(msg)
    
    # Convert message to base64 encoded string
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    
    # Create the email send request
    create_message = {
        'raw': encoded_message
    }
    
    # Actually send the message
    try:
        sent_message = service.users().messages().send(userId="me", body=create_message).execute()
        print(f"Email sent to {recipient_email}, Message Id: {sent_message['id']}")
        return True
    except Exception as e:
        print(f"An error occurred while sending email: {e}")
        return False


def create_calendar_event(summary, description, start_time, end_time, attendees=None, location=None):
    """
    Create a Google Calendar event with enhanced details
    """
    creds = get_google_credentials()
    if not creds:
        print("No valid Google credentials found")
        return False
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        # Format attendees
        attendee_list = []
        if attendees:
            attendee_list = [{'email': email} for email in attendees if '@' in email]
        
        # Create event with all available details
        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'America/Los_Angeles',  # Adjust timezone as needed
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'America/Los_Angeles',  # Adjust timezone as needed
            },
            'reminders': {
                'useDefault': True,
            },
        }
        
        if attendee_list:
            event['attendees'] = attendee_list
        
        if location:
            event['location'] = location
        
        event = service.events().insert(calendarId='primary', body=event).execute()
        print(f'Event created: {event.get("htmlLink")}')
        return True
    except Exception as e:
        print(f"Error creating calendar event: {str(e)}")
        return False


def get_google_credentials():
    """
    Get Google API credentials, requesting authorization if needed
    """
    creds = None
    # Check if token.pickle file exists
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            try:
                creds = pickle.load(token)
            except Exception as e:
                print(f"Error loading credentials from token.pickle: {str(e)}")
                return None
            
    # If no valid credentials available, return None
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Error refreshing credentials: {str(e)}")
                return None
        else:
            print("No valid Google credentials found - need user authorization")
            return None
            
    return creds

@app.route('/authorize_google')
def authorize_google():
    """
    Start the Google OAuth authorization flow
    """
    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', SCOPES)
    flow.redirect_uri = url_for('oauth2callback', _external=True)
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true')
    
    session['state'] = state
    
    return redirect(authorization_url)


@app.route('/oauth2callback')
def oauth2callback():
    """
    Handle the OAuth 2.0 callback from Google
    """
    # Check if state exists in session
    if 'state' not in session:
        return jsonify({"error": "Authorization state not found. Please start the authentication process again."}), 400
    
    state = session['state']
    
    flow = InstalledAppFlow.from_client_secrets_file(
        'credentials.json', SCOPES)
    flow.redirect_uri = url_for('oauth2callback', _external=True)
    
    # Use the authorization server's response to fetch the OAuth 2.0 tokens
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)
    
    # Store the credentials for later use
    creds = flow.credentials
    with open('token.pickle', 'wb') as token:
        pickle.dump(creds, token)
    
    return redirect(url_for('index'))


@app.route('/send_task_notification_manual', methods=['POST'])
def send_task_notification_manual():
    """
    Endpoint to manually send a task notification to someone by name (both email and Slack)
    """
    data = request.get_json()
    recipient_name = data.get('recipient_name', '').lower()
    task = data.get('task', '')
    due_date = data.get('due_date')
    
    if not recipient_name or not task:
        return jsonify({"error": "Missing recipient name or task"}), 400
    
    # Load contacts from your existing CSV file
    contacts = load_contacts()
    
    # Check if contact exists
    if recipient_name not in contacts:
        return jsonify({"error": f"No contact found for '{recipient_name}' in contacts CSV"}), 404
    
    contact_info = contacts[recipient_name]
    results = {
        "email": False,
        "slack": False
    }
    
    # Try to send email notification
    if contact_info.get('email'):
        try:
            results["email"] = send_task_email(
                recipient_name=recipient_name,
                recipient_email=contact_info['email'],
                task=task,
                due_date=due_date
            )
        except Exception as e:
            print(f"Error sending email: {str(e)}")
    
    # Try to send Slack notification
    if contact_info.get('slack_id'):
        try:
            results["slack"] = send_slack_message(
                slack_id=contact_info['slack_id'],
                recipient_name=recipient_name,
                task=task,
                due_date=due_date
            )
        except Exception as e:
            print(f"Error sending Slack message: {str(e)}")
    
    # Check if at least one notification was sent
    if results["email"] or results["slack"]:
        return jsonify({
            "success": True, 
            "message": f"Task notifications sent to {recipient_name}",
            "details": results
        }), 200
    else:
        return jsonify({
            "error": "Failed to send any notifications", 
            "details": results
        }), 500


@app.route('/set_slack_token', methods=['POST'])
def set_slack_token():
    """
    Endpoint to set the Slack Bot Token in environment variables
    """
    try:
        data = request.get_json()
        token = data.get('slack_token')
        
        if not token:
            return jsonify({"error": "No Slack token provided"}), 400
        
        # Update token in .env file
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
        set_key(dotenv_path, "SLACK_BOT_TOKEN", token)
        
        # Update in current environment
        os.environ["SLACK_BOT_TOKEN"] = token
        
        # Update the global slack client
        global slack_client
        slack_client = WebClient(token=token)
        
        # Test the token with a simple API call
        try:
            response = slack_client.auth_test()
            team_name = response['team']
            bot_name = response['user']
            
            return jsonify({
                "success": True, 
                "message": f"Connected to Slack workspace: {team_name} as {bot_name}",
                "team_id": response['team_id'],
                "bot_id": response['user_id']
            }), 200
        except SlackApiError as e:
            return jsonify({
                "error": "Invalid Slack token", 
                "details": e.response['error']
            }), 400
            
    except Exception as e:
        return jsonify({"error": f"Error setting Slack token: {str(e)}"}), 500


@app.route('/set_contacts_csv_path', methods=['POST'])
def set_contacts_csv_path():
    """
    Endpoint to set the path to your existing contacts CSV file
    """
    try:
        data = request.get_json()
        csv_path = data.get('csv_path')
        
        if not csv_path:
            return jsonify({"error": "No CSV path provided"}), 400
        
        if not os.path.exists(csv_path):
            return jsonify({"error": f"CSV file not found at {csv_path}"}), 404
        
        # Update path in .env file
        dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
        set_key(dotenv_path, "CONTACTS_CSV", csv_path)
        
        # Update in current environment
        os.environ["CONTACTS_CSV"] = csv_path
        
        # Test loading the contacts
        contacts = load_contacts()
        
        return jsonify({
            "success": True, 
            "message": f"Updated contacts CSV path to {csv_path}",
            "contacts_count": len(contacts)
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error setting contacts CSV path: {str(e)}"}), 500


@app.route('/')
def index():
    """Simple index page"""
    has_credentials = os.path.exists('token.pickle')
    has_contacts = os.path.exists(CONTACTS_CSV)
    
    return jsonify({
        "application": "MeetStream Calendar Integration with Groq AI, Gmail, and Slack",
        "status": "Running",
        "google_credentials": "Authorized" if has_credentials else "Not authorized",
        "slack_integration": "Available" if slack_client else "Not configured",
        "groq_ai_available": bool(groq_client),
        "contacts_csv": f"Available at {CONTACTS_CSV}" if has_contacts else f"Not found at {CONTACTS_CSV}",
        "auth_url": url_for('authorize_google', _external=True) if not has_credentials else None,
        "endpoints": {
            "create_bot": "/create_bot",
            "fetch_transcript": "/fetch_transcript",
            "remove_bot": "/remove_bot",
            "authorize_google": "/authorize_google",
            "send_task_notification_manual": "/send_task_notification_manual",
            "set_slack_token": "/set_slack_token",
            "set_contacts_csv_path": "/set_contacts_csv_path"
        }
    })


if __name__ == '__main__':
    # Check for API keys
    if not os.getenv("GROQ_API_KEY"):
        print("Warning: GROQ_API_KEY not found in environment variables. AI processing will be disabled.")
    
    if not os.getenv("SLACK_BOT_TOKEN"):
        print("Warning: SLACK_BOT_TOKEN not found in environment variables. Slack messaging will be disabled.")
    
    # Validate CSV file path
    if not os.path.exists(CONTACTS_CSV):
        print(f"Warning: Contacts CSV file not found at {CONTACTS_CSV}. Set the correct path using the API endpoint.")
    else:
        # Load contacts on startup to verify the CSV format
        initial_contacts = load_contacts()
        print(f"Found {len(initial_contacts)} contacts in {CONTACTS_CSV}")
    
    app.run(debug=True, port=5000)