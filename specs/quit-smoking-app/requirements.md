# Requirements Document

## Introduction

TheLastCigarette is a mobile application designed to help users quit smoking through gradual reduction, progress tracking, and behavioral support. The app provides a comprehensive platform for users to set quit plans, log cigarette consumption, track progress, maintain a mood/craving journal, and receive motivational support through achievements and reminders.

## Requirements

### Requirement 1: User Authentication and Account Management

**User Story:** As a user, I want to create an account and securely log in, so that I can access my personalized quit smoking data across sessions.

#### Acceptance Criteria

1. WHEN a new user accesses the app THEN the system SHALL display signup and login options
2. WHEN a user provides valid email and password for signup THEN the system SHALL create a new account and authenticate the user
3. WHEN a user provides valid credentials for login THEN the system SHALL authenticate the user and redirect to the home dashboard
4. WHEN a user provides invalid credentials THEN the system SHALL display an appropriate error message
5. WHEN a user is authenticated THEN the system SHALL maintain the session using JWT tokens
6. WHEN a user logs out THEN the system SHALL clear the authentication session

### Requirement 2: Quit Plan Configuration

**User Story:** As a user, I want to set up my personalized quit plan with daily targets and reduction schedule, so that I can follow a structured approach to quitting smoking.

#### Acceptance Criteria

1. WHEN a new user completes signup THEN the system SHALL prompt them to set their current daily average cigarette consumption
2. WHEN a user sets their daily average THEN the system SHALL allow them to configure a target quit date
3. WHEN a user sets a quit date THEN the system SHALL calculate a gradual reduction schedule
4. WHEN a user configures reduction frequency THEN the system SHALL update daily targets accordingly
5. WHEN a user saves their quit plan THEN the system SHALL store the configuration and apply it to daily limits
6. WHEN a user wants to modify their plan THEN the system SHALL allow updates through the settings screen

### Requirement 3: Cigarette Consumption Logging

**User Story:** As a user, I want to log each cigarette I smoke throughout the day, so that I can track my actual consumption against my daily target.

#### Acceptance Criteria

1. WHEN a user is on the home screen THEN the system SHALL display their remaining cigarettes for the day
2. WHEN a user taps the "Log Cigarette" button THEN the system SHALL increment their daily count by one
3. WHEN a user logs a cigarette THEN the system SHALL update the remaining count and progress bar in real-time
4. WHEN a user reaches their daily limit THEN the system SHALL display a warning notification
5. WHEN a user exceeds their daily limit THEN the system SHALL track the overage and update statistics
6. WHEN the day changes THEN the system SHALL reset the daily count and apply the new target limit

### Requirement 4: Progress Tracking and Statistics

**User Story:** As a user, I want to view my progress over time including money saved and health improvements, so that I can stay motivated in my quit journey.

#### Acceptance Criteria

1. WHEN a user accesses the progress screen THEN the system SHALL display a graph of daily cigarette consumption vs targets
2. WHEN displaying progress THEN the system SHALL calculate and show total money saved based on cigarette price and reduction
3. WHEN showing statistics THEN the system SHALL display consecutive days below target
4. WHEN calculating savings THEN the system SHALL use user-configured cigarette cost or default pricing
5. WHEN a user achieves milestones THEN the system SHALL unlock and display achievement badges
6. WHEN viewing progress THEN the system SHALL show health improvement messages based on quit duration

### Requirement 5: Mood and Craving Journal

**User Story:** As a user, I want to log my daily mood and craving intensity, so that I can identify patterns and track my emotional progress.

#### Acceptance Criteria

1. WHEN a user accesses the journal screen THEN the system SHALL provide mood selection options (happy, neutral, sad, angry)
2. WHEN logging an entry THEN the system SHALL allow users to set craving intensity on a scale of 1-10
3. WHEN creating a journal entry THEN the system SHALL allow optional text notes
4. WHEN a user saves a journal entry THEN the system SHALL timestamp and store the entry
5. WHEN viewing journal history THEN the system SHALL display past entries with date, mood, and craving level
6. WHEN a user has multiple entries per day THEN the system SHALL allow viewing all entries for that date

### Requirement 6: Craving Support and SOS Features

**User Story:** As a user, I want immediate support tools when experiencing strong cravings, so that I can resist the urge to smoke.

#### Acceptance Criteria

1. WHEN a user experiences a craving THEN the system SHALL provide an easily accessible SOS feature
2. WHEN SOS is activated THEN the system SHALL display motivational messages about why they quit
3. WHEN using SOS tools THEN the system SHALL offer guided breathing exercises
4. WHEN a user needs distraction THEN the system SHALL provide a delay timer (10 minutes default)
5. WHEN displaying motivational content THEN the system SHALL show personalized quotes based on user progress
6. WHEN SOS features are used THEN the system SHALL optionally log the craving event for tracking

### Requirement 7: Achievements and Rewards System

**User Story:** As a user, I want to earn achievements and rewards for meeting my goals, so that I feel motivated to continue my quit journey.

#### Acceptance Criteria

1. WHEN a user meets daily targets THEN the system SHALL track consecutive successful days
2. WHEN specific milestones are reached THEN the system SHALL unlock achievement badges
3. WHEN calculating rewards THEN the system SHALL include money saved milestones (₹500, ₹1000, etc.)
4. WHEN displaying achievements THEN the system SHALL show both earned and upcoming rewards
5. WHEN a user exceeds targets THEN the system SHALL apply configured punishment reminders (donation prompts)
6. WHEN achievements are unlocked THEN the system SHALL display congratulatory notifications

### Requirement 8: Settings and Customization

**User Story:** As a user, I want to customize my app settings and preferences, so that the app works according to my personal needs and schedule.

#### Acceptance Criteria

1. WHEN a user accesses settings THEN the system SHALL allow modification of daily limits and quit date
2. WHEN configuring reminders THEN the system SHALL allow users to enable/disable notification reminders
3. WHEN setting up punishments THEN the system SHALL allow users to configure donation amounts and triggers
4. WHEN customizing rewards THEN the system SHALL allow users to edit their personal treats list
5. WHEN updating cigarette cost THEN the system SHALL recalculate all money-saved statistics
6. WHEN changing reduction frequency THEN the system SHALL update future daily targets accordingly

### Requirement 9: Data Persistence and Synchronization

**User Story:** As a user, I want my data to be securely stored and accessible across app sessions, so that I don't lose my progress.

#### Acceptance Criteria

1. WHEN a user logs data THEN the system SHALL persist all information to the backend database
2. WHEN the app is reopened THEN the system SHALL restore the user's current state and progress
3. WHEN network connectivity is lost THEN the system SHALL queue changes for synchronization when reconnected
4. WHEN data conflicts occur THEN the system SHALL prioritize the most recent timestamp
5. WHEN a user reinstalls the app THEN the system SHALL restore their complete history upon login
6. WHEN backing up data THEN the system SHALL ensure user privacy and data security compliance
