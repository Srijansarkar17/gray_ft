# AgentsAI - AI Agents for Decision Automation and Cognitive Augmentation

## About The Project 💡
Our AI-driven platform leverages real-time voice intelligence and MeetStream-powered virtual agents to enhance legal and professional workflows — from recording court hearings and recommending verdicts, to automating tasks in online meetings like scheduling, emailing, and more — all designed to boost productivity, precision, and ease of collaboration.
![WhatsApp Image 2025-04-24 at 11 27 20_3e75ce5e](https://github.com/user-attachments/assets/07d2c34c-1ab5-44bb-a4b2-341544b5d22e)

## Technological Stack⌨️
### 🛠️ Frontend

- Next.js  Modern React-based framework for performant, scalable web apps.
- TailwindCSS  Utility-first CSS for rapid UI building.
- ShadCN/UI  Clean, accessible UI components.

# Agentic AI 🤖

- ### MeetStream AI Agent

- *MeetStream Agent* is a Flask-based application that integrates with the MeetStream API to extract zoom and google meeting transcripts and automate follow-up tasks.

- The application uses *Groq AI* to analyze meeting transcripts for scheduling intents and task assignments, then automates the creation of calendar events and notification of task assignments.

- *Core functionality* includes:
  - Creating and removing MeetStream bots for transcript collection
  - Processing meeting transcripts using Groq AI to identify action items
  - Automatically creating Google Calendar events based on scheduling intents
  - Sending task assignments to meeting participants via email and Slack

- *Integration with multiple services*:
  - Google OAuth for Calendar and Gmail access
  - Slack for sending task notifications
  - Groq AI for natural language processing of transcripts
  - MeetStream API for bot creation and transcript retrieval

- *Contact management* through a CSV file that maps names to email addresses and Slack IDs, with intelligent partial name matching for identifying task assignees mentioned in meetings.

- *Key endpoints*:
  - /create_bot - Creates a MeetStream bot and stores its ID
  - /fetch_transcript - Retrieves and processes meeting transcripts
  - /remove_bot - Removes the current MeetStream bot
  - /authorize_google - Handles Google OAuth authentication
  - /send_task_notification_manual - Manually sends task notifications
  - /set_slack_token - Configures Slack integration
  - /set_contacts_csv_path - Sets the path to the contacts database

- *Task notification system* that:
  - Formats and sends professional email notifications via Gmail API
  - Creates formatted Slack messages with task details and due dates
  - Tracks successful notifications in the system's response

- *Calendar event creation* that builds detailed Google Calendar events with:
  - Auto-detected meeting title, time and description
  - Proper formatting of attendee lists and location information
  - Appropriate timezone settings and reminders

- *Security features* include:
  - OAuth 2.0 for Google API access
  - Environment variable storage for API keys
  - Token persistence for maintaining authorized sessions
  - Secure session management in the Flask application

- *Error handling* throughout the application provides graceful degradation when services are unavailable, with detailed logging of issues encountered.

- The application serves as a comprehensive meeting assistant that eliminates manual follow-up tasks by automatically identifying and executing on action items from meeting transcripts.

  ![WhatsApp Image 2025-04-24 at 12 58 30_c49d2529](https://github.com/user-attachments/assets/7aee64e9-138f-42e7-a669-6d80059b8c5f)

  ![WhatsApp Image 2025-04-24 at 12 56 51_65da4789](https://github.com/user-attachments/assets/8fb380ff-d89e-402a-81d1-df9430348aff)

  ![WhatsApp Image 2025-04-24 at 12 56 30_0b72cfb7](https://github.com/user-attachments/assets/87a3a9f0-7b43-4447-b65e-6e64a0bc08ae)



