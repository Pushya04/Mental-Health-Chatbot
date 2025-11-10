# Empatalk

A full-stack, AI-powered mental health chatbot designed to provide supportive conversations, risk detection, and resource recommendations. Built with React, Node.js/Express, MongoDB, and a Python NLP service.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Key Files Explained](#key-files-explained)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Real-time chat with AI-powered responses
- Suicide risk and emotion detection
- Session-based chat history
- User authentication and profile management
- Feedback collection
- Resource recommendations
- Clean, modern UI

---

## Architecture

- **Frontend:** React (client/)
- **Backend:** Node.js/Express (server/)
- **Database:** MongoDB
- **ML Service:** Python FastAPI (ml_service/) serving NLP models

---

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python 3.8+
- MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/Pushya04/Empatalk.git
cd Empatalk
```

### 2. Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

#### Python ML Service

```bash
cd ../ml_service
pip install -r requirements.txt
```

### 3. Environment Variables

- Create a `.env` file in `server/` with your MongoDB URI and JWT secret.

### 4. Start the Services

- **Backend:**  
  `cd server && npm start`
- **Frontend:**  
  `cd client && npm start`
- **ML Service:**  
  `cd ml_service && uvicorn serve_model:app --host 127.0.0.1 --port 8008`

---

## Project Structure

```
Empatalk/
│
├── client/           # React frontend
│   └── src/
│       ├── api/      # API service files
│       ├── components/ # UI components
│       ├── pages/    # Main pages (Chat, Login, Profile, etc.)
│       ├── store/    # Redux store
│       └── ...       
│
├── server/           # Node.js/Express backend
│   ├── controllers/  # Route controllers
│   ├── model/        # Mongoose models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── ...
│
├── ml_service/       # Python FastAPI ML service
│   └── serve_model.py
│
├── NLP_model/        # Model training notebooks
│
└── README.md
```

---

## Key Files Explained

- `client/src/components/ChatWindow.jsx`: Main chat interface, handles real-time replies.
- `client/src/pages/ChatHistory.jsx`: Displays chat history grouped by session.
- `server/controllers/chatcontroller.js`: Core chat logic, routes messages to ML model.
- `server/model/userModel.js`: User schema for MongoDB.
- `ml_service/serve_model.py`: FastAPI app serving the NLP model.
- `NLP_model/suicide detection/Suicide_detection.ipynb`: Model training and experimentation.

---

## Usage

1. Register or log in as a user.
2. Start a new chat session and interact with the AI chatbot.
3. View chat history, manage your profile, and provide feedback.
4. The chatbot detects risk/emotion and provides supportive responses and resources.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---
