# Building Software with AI Coding Assistants

## A Hands-On Course for Non-Coders

---

## Introduction: A New Way to Build Software

Software development is changing. For decades, building and maintaining software required learning to read and write code — years of study in programming languages, frameworks, and tools. That barrier kept most people on the sidelines, even those who understood business problems deeply, managed technical teams, or had ideas they couldn't bring to life on their own.

AI coding assistants have fundamentally shifted this equation. These tools can read, write, understand, and modify code on your behalf. They can diagnose bugs, explain how systems work, implement features, and write tests — all from a natural language conversation. The bottleneck is no longer "can you write code?" It's "can you describe what you want clearly enough for an AI to help you build it?"

That's a communication skill, not a programming skill. And it's one that can be taught.

This course exists for people who work with software but don't write it: project managers, product owners, designers, entrepreneurs, QA professionals, technical writers, and anyone who collaborates with development teams or wants to build something themselves. You won't learn to program. You'll learn something arguably more durable — how software systems work, how they fail, and how to use AI tools to investigate, fix, and build with confidence.

The approach is hands-on from day one. Rather than studying theory in the abstract, you'll work with a real application, encounter real bugs, and fix them through conversation with an AI assistant. Each module teaches you the concepts you need, then puts you in a situation where you have to apply them. By the end, you'll speak the language of software development fluently enough to collaborate with any technical team — or to build and maintain software on your own with AI as your partner.

---

## Course Overview

### Format and Structure

This is an asynchronous course with 5 modules. Each module follows the same structure: theory topics that build conceptual vocabulary, followed by a hands-on bug scenario using a real application, and learning outcomes tied to both domain knowledge and AI assistant communication skills. Students read all of a module's theory content first, building the vocabulary and mental models they need, then apply that understanding to the bug scenario. The theory gives you the language; the bug gives you the practice. Modules are designed to be completed in order, as concepts build on each other.

### Course Philosophy

The core skill this course develops is **technical communication with AI tools**. In every module, students practice:

1. **Observing** — What is the application doing vs. what should it be doing?
2. **Describing** — How do I articulate this problem clearly to an AI assistant?
3. **Interpreting** — What is the AI suggesting, and does it make sense given what I've learned?
4. **Verifying** — Did the fix work? How do I confirm it?

### The Debugging Conversation Template

Each time you encounter a bug, use this template to structure your conversation with the AI assistant:

1. **Observe:** "I see [what the app is doing]. I expected to see [what it should be doing]."
2. **Describe:** "This happens when I [specific action]. It does/doesn't happen when [scope]. I checked [what you already investigated] and found [result]."
3. **Interpret:** After the assistant suggests a fix — "That makes sense because [reason]" or "I'm not sure about that because [concern]. Can you explain why that would fix the problem?"
4. **Verify:** "I applied the fix. Here's what I see now: [result]. Is there anything else I should check to make sure nothing else broke?"

This template applies to every module's bug scenario. The vocabulary gets more precise as you learn each module's concepts, but the structure stays the same.

### Prerequisites

- Comfort using web applications and navigating a file system
- Willingness to interact with a command-line interface (guided)
- No prior programming experience required

---

## Module 1: Your Development Environment — Tools of the Trade

### Theory Topics

**Part A: Understanding the Application** *(sections 1.1–1.6 — what FitCheck is, how its pieces fit together, and the debugging mindset you'll use throughout the course)*

#### 1.1 The Project: FitCheck
The application students will work with throughout this course is **FitCheck** — a fitness workout logging application that helps users track their workouts and check weather conditions for their city. The app features: an **HTML/CSS/JavaScript frontend** with a dashboard showing a New Workout form, current weather, a total workouts counter, recent workout history, user preferences, and community reviews; a **Node.js/Express backend** that handles business logic, user management, and workout CRUD operations; a **PostgreSQL database** (relational) storing user profiles and workout history; a **MongoDB database** (a flexible document store, explained in Module 4) storing user-generated workout reviews and ratings; integration with the **OpenWeatherMap API** to display current weather conditions for the user's selected city; **user authentication** so each person has a private profile, workout history, and preferences; **user preferences** — users can set temperature units (metric/imperial) and select from predefined city locations; and a **CI/CD pipeline** that packages the app into containers and deploys it to a cloud environment (containers and CI/CD are covered in Module 5). Students don't need to understand all of these terms yet — each one will be taught in detail throughout the course. For now, the goal is to see that FitCheck is a realistic application with many interconnected parts.

#### 1.2 FitCheck in Action: The Happy Path
Before we start breaking things, here's what FitCheck looks like when everything is working correctly.

A user opens the app in their browser and sees a login screen. They enter their email and password, which the frontend sends to the backend. The backend checks the credentials against the PostgreSQL database, confirms the user's identity, and sends back a token — a small piece of data that proves "this person is logged in." The frontend stores that token and uses it with every future request so the user doesn't have to log in again on each click.

Once authenticated, the user lands on their dashboard. The frontend immediately makes several requests to the backend: one to fetch the user's profile and preferences, one to get the current weather for the user's selected city, and one to load the user's recent workout history. The weather request goes to the OpenWeatherMap API. All of this happens in a few seconds — the user sees brief loading spinners, then the dashboard fills in with the weather widget, a total workouts counter, and cards showing recent completed workouts.

The user decides to log a new workout. They select a workout type (Cardio, Strength, or Endurance), pick the date, choose a duration (0.5 to 2.5 hours), select a city, and click "Add Workout." The frontend sends this data to the backend, which validates it (is the date not in the future? is the type valid? is the duration a positive number?), stores the workout in the PostgreSQL database, and confirms the change. The Recent Workouts section and Total Workouts counter update immediately to reflect the new entry.

After logging the workout, the user writes a short review: "Great leg day, the squat progression felt right." The frontend sends the review to the backend, which stores it in MongoDB — the document database suited for flexible, text-heavy content like reviews. Other users browsing the Community Reviews section will see this review appear in their feed.

Later, a developer pushes a small update — a bug fix to the weather widget. The CI/CD pipeline picks up the change, runs the automated tests to make sure nothing is broken, builds the application into a container, and deploys it to the production server. The user refreshes the page the next morning and sees the fix, with no idea that anything changed behind the scenes.

That's the goal: everything works together so seamlessly that users never have to think about what's happening underneath. Throughout this course, each module will hand you a version of FitCheck where one part of this chain is broken. Your job — with the help of an AI coding assistant — is to figure out what went wrong, why, and how to fix it.

#### 1.3 The Big Picture: How a Modern Web Application Works
It helps to see the full landscape before diving into the details. A web application like FitCheck isn't one thing — it's several systems working together, each with its own job. Think of it as a chain: every link does something different, and a problem in any single link affects the whole experience.

The **frontend** is what users see and interact with — the buttons, the workout dashboard, the weather widget. It runs in the browser and is responsible for making the application look right and respond to user actions.

Behind it sits the **backend**, a server that does the thinking. When a user logs in, logs a workout, or saves a preference, the frontend sends that request to the backend, which decides what to do with it. The backend is where the rules live: who's allowed to do what, how data gets validated, what happens when something goes wrong.

The backend doesn't remember anything on its own — that's what **databases** are for. FitCheck uses two kinds: a relational database (PostgreSQL) that stores structured data like user profiles and workout history in neat rows and columns, and a document database (MongoDB) that stores flexible, varied data like community reviews. Together they give the application its memory.

Not everything the app needs lives inside it. The weather data displayed on the dashboard comes from an **external API** — a service run by someone else (OpenWeatherMap) that FitCheck talks to over the internet. The app also has its own **internal API**, a set of endpoints that let the frontend and backend communicate with each other. APIs are the bridges between systems, and understanding how they work is essential to diagnosing problems that cross those boundaries.

Wrapping around all of this is **security** — the locks on the doors. Authentication confirms who a user is; authorization determines what they're allowed to do. Passwords need to be stored safely, API keys need to be kept secret, and every endpoint needs to be protected from misuse. Security isn't a feature you bolt on at the end; it's a concern that runs through every layer.

Once the application works on a developer's laptop, it needs to reach real users — that's **deployment**. The code has to move from a local machine to a server on the internet, with the right configuration, the right environment variables, and the right safeguards. Containers (covered in Module 5) package everything up so it runs the same way everywhere, and CI/CD pipelines automate the process so changes can be shipped reliably.

Finally, **testing** is how you make sure nothing breaks along the way. Every time someone fixes a bug or adds a feature, tests verify that the rest of the application still works as expected. Without tests, every change is a gamble.

This course walks through each of these layers across five modules. You'll start by getting comfortable with the tools and environment (Module 1), then explore the frontend (Module 2), the backend and the APIs that connect everything (Module 3), databases and the security that protects them (Module 4), and finally testing and deployment (Module 5). By the end, you won't just understand each layer in isolation — you'll understand how they connect, how problems in one layer surface in another, and how to talk about all of it with precision.

#### 1.4 Debugging as a Systematic Practice
Now that students understand *what* FitCheck is and *how* its pieces fit together, the next question is: what do you do when something goes wrong? When something breaks in software, the instinct is to start changing things and hope the problem goes away. **Debugging** is the disciplined alternative — a systematic process for finding and fixing the root cause. The methodology follows a predictable pattern. First, **reproduce the problem** — can you make the bug happen consistently? If it only happens sometimes, what conditions trigger it? Second, **isolate the problem** — narrow down *where* it's occurring. Is it a frontend issue or a backend issue? Does it happen with all users or just one? Does it happen on all pages or just the dashboard? Third, **check the simplest explanation first** — is the server running? Is the database connected? Is there a typo in the URL? Many bugs have mundane causes. Fourth, **change one thing at a time** — if you change three things simultaneously and the bug disappears, you won't know which change fixed it (and the other two changes might introduce new problems). Fifth, **verify the fix** — confirm the bug is gone, and check that nothing else broke. This methodology maps directly to how students should communicate with AI assistants. Rather than telling the assistant "it's broken, fix it," students learn to say: "I can reproduce this by doing X, it only happens when Y, I've confirmed that Z is working correctly, so the problem is somewhere between Y and the response." The more students narrow the problem before involving the assistant, the faster and more accurately the assistant can help. One important reassurance: making mistakes is a normal and expected part of this process. Software development — even with AI assistance — involves trial and error. If a fix makes things worse, you can undo it. If you accidentally change the wrong file, Git lets you revert to a previous version. If the application stops working entirely, you can reset to a known good state. Every professional developer breaks things regularly; what makes them effective isn't that they avoid mistakes but that they know how to recover from them. The tools you'll learn in this module — especially Git — are specifically designed to make recovery safe and straightforward. This five-step process applies to every bug in every module of this course.

#### 1.5 Working with an AI Coding Assistant
This is the tool that ties the entire course together. An **AI coding assistant** is a conversational tool that can read, understand, and modify code on your behalf. Students learn the fundamentals of effective interaction: being specific about what you observe and what you expect, providing context (which file, which feature, what you were doing), asking the assistant to explain its suggestions before applying them, and verifying results after changes are made. The course introduces the **Observe → Describe → Interpret → Verify** loop that students will use in every subsequent module and every bug scenario: **Observe** what the application is doing vs. what it should be doing. **Describe** the problem clearly to the AI assistant, using the precise vocabulary learned in each module. **Interpret** the assistant's suggestions — do they make sense given what you know? **Verify** the fix — did it actually work, and did it break anything else? To illustrate the difference precise communication makes, consider two ways a student might describe the same problem. A vague description: "The weather part of the app is broken." A precise description: "The weather widget on the dashboard shows 'Loading...' and never displays the actual temperature. I checked the browser's Network tab and the request to `/api/weather` is returning a 500 Internal Server Error status code. The rest of the dashboard loads fine." The first gives the assistant almost nothing to work with — it will have to ask several clarifying questions or guess. The second gives the assistant a specific symptom, a specific location, a diagnostic observation, and the scope of the problem, which is often enough to identify the root cause immediately. Students also learn practical mechanics: how to give the assistant access to the project, how to ask it to look at specific files, and how to undo changes if something goes wrong.

#### 1.6 When the AI Assistant Gets It Wrong
AI coding assistants are powerful, but they are not infallible. Students learn to approach the assistant's suggestions with **healthy skepticism** — trusting but verifying. Key concepts include: recognizing when the assistant is **guessing** rather than reasoning from the actual code (for example, suggesting a fix for a file it hasn't read, or assuming a library version without checking); understanding that the assistant can sound **confident and wrong** at the same time, because it generates plausible-sounding explanations regardless of accuracy; and knowing when to **push back** by asking "Are you sure?" or "Can you check the actual file first?" Students practice identifying warning signs: the assistant's fix doesn't match the error message, the explanation contradicts something learned earlier in the course, or applying a suggestion makes things worse. They learn a critical recovery skill — how to **undo changes and try a different approach** rather than letting the assistant layer fix upon fix upon fix. Students also learn when **not** to apply a fix at all: if the suggested change involves committing secrets (like API keys or passwords) to version control, if it violates a constraint you know to be true (like changing a database schema in production without a migration), or if you don't understand the fix well enough to verify whether it worked. In these cases, the right move is to pause and ask the assistant to explain further — or to escalate to a teammate. The guiding principle: the assistant is a collaborator, not an authority. You are responsible for verifying that what it suggests actually works.

**Part B: Your Local Tools** *(sections 1.7–1.12 — the terminal, commands, dependencies, and project structure)*

#### 1.7 The Terminal: A Text-Based Interface to Your Computer
Most people interact with computers through graphical interfaces — clicking icons, dragging files, pressing buttons. Developers (and people who work with developers) also use the **terminal** — a text-based interface where you type commands and receive text responses. The terminal isn't a relic; it's often faster and more precise than a graphical interface for tasks like navigating folders, running applications, and managing files. Students learn to open a terminal on their operating system (Terminal on Mac, Command Prompt or PowerShell on Windows, or the terminal built into code editors like VS Code) and understand that this is where they'll launch FitCheck, install dependencies, run tests, and interact with Git throughout the course. The goal isn't mastery — it's comfort and familiarity.

#### 1.8 Essential Terminal Commands
Students will use a small set of terminal commands repeatedly throughout the course. **`pwd`** (print working directory) shows your current location in the file system — useful when you're not sure where you are. **`ls`** lists the files and folders in the current directory, so you can see what's here. **`cd`** (change directory) moves you to a different folder — `cd fitcheck` moves into the fitcheck folder, and `cd ..` moves up one level. **`mkdir`** creates a new folder. **`clear`** clears the screen when the terminal gets cluttered. These navigation commands are the foundation — students practice them until they feel as natural as clicking through folders in a file browser.

#### 1.9 Running and Managing Applications from the Terminal
Beyond navigation, students need to know the commands that control FitCheck. **`npm install`** downloads and installs all the libraries and packages that FitCheck depends on — it's typically the first command run after cloning a project. **`npm start`** launches the application so it can be accessed in a browser. **`npm test`** runs the test suite (used extensively in Module 5). **`Ctrl+C`** stops a running process — essential because once FitCheck is running, it occupies the terminal until you stop it. Students also learn to read terminal output: a successful start might display "Server running on port 3000," while a failure might show a red error message or a stack trace. Learning to distinguish "it worked" from "something went wrong" in terminal output — even without understanding every line — is a practical skill that pays off in every module.

#### 1.10 Dependencies and Package Management
Modern applications aren't built from scratch — they rely on thousands of pre-built libraries created by other developers. These are called **dependencies**. FitCheck depends on Express (for handling backend requests), a PostgreSQL driver (for talking to the database), and dozens of other packages. **npm** (Node Package Manager) is the tool that manages these dependencies. The file **`package.json`** is the project's manifest — it lists every dependency the project needs, along with the version required. When students run `npm install`, npm reads `package.json` and downloads all listed dependencies into a folder called **`node_modules/`**. This folder can contain thousands of files — which is why it's excluded from Git via `.gitignore` (there's no need to store it, since anyone can regenerate it by running `npm install`). Dependencies can also introduce problems: a library might release a new version with a breaking change, or a dependency might have a known security vulnerability. Students learn that when the AI assistant suggests installing a package, it's adding a dependency — and when mysterious errors appear after an update, a dependency conflict may be the cause.

#### 1.11 Project Structure: Finding Your Way Around
Before students can describe where a problem lives, they need to understand how FitCheck is organized. A typical web project follows a predictable folder structure. The **root directory** contains configuration files: `package.json` (the dependency manifest), `.gitignore` (files Git should skip), `.env` (environment variables, not committed), and `README.md` (a description of the project). The **`src/`** folder contains the source code — the actual application. Inside `src/`, the frontend and backend are typically separated: a `client/` or `frontend/` folder holds the HTML pages, CSS stylesheets, JavaScript files, and user-facing assets, while a `server/` or `backend/` folder holds the routes, middleware, and business logic. A **`tests/`** folder holds the test files. A **`public/`** or `static/` folder holds images, fonts, and other files served directly to the browser. Understanding this layout means students can tell the AI assistant "the bug is in the frontend weather component" or "check the backend route for workouts" rather than just "something is broken" — and the assistant can go straight to the right file.

#### 1.12 Documentation: The Project's Instruction Manual
Every well-maintained project includes **documentation** — written explanations of what the project does, how to set it up, and how its parts work. The **README** (typically `README.md` in the project root) is the front door: it explains what the project is, how to install and run it, and any important setup steps. Students will rely on FitCheck's README to get the app running for the first time. Beyond the README, documentation appears in several forms. **Inline comments** are notes embedded in the code itself, explaining *why* something works a certain way (not just what it does). **API documentation** describes what endpoints exist, what parameters they accept, and what responses they return — essential when working with both FitCheck's own API and external services like OpenWeatherMap. **Configuration files** often include comments explaining what each setting controls. Students learn to check the documentation *before* asking the AI assistant — often the answer is already written down. They also learn that when the AI assistant suggests a solution, it's worth asking: "Is this consistent with what the project's documentation says?" Documentation is also something students can ask the AI assistant to help create or update after making changes.

**Part C: Version Control and Collaboration** *(sections 1.13–1.17 — Git, commits, branches, and GitHub)*

#### 1.13 What Is Version Control?
Imagine writing a long document and wanting to save every version along the way — not just the current draft, but every meaningful change you've ever made, with notes about what changed and why. **Version control** is that system for software. It tracks every change to every file in a project, who made the change, when, and why. If something breaks, you can look at what changed recently. If a change turns out to be a mistake, you can revert it. Version control isn't just a safety net — it's the foundation of how teams collaborate on software.

#### 1.14 Git: The Standard Version Control System
**Git** is the version control system used by virtually every modern software project. It manages a project's history as a series of **commits** — snapshots of the project at a point in time, each with a message describing what changed. Think of commits as snapshots in a photo album of your project's life — each one captures the project at a specific moment, and you can flip back to any earlier snapshot to see (or restore) exactly what the project looked like then. A **repository** (or "repo") is the complete history of a project — all its files plus all its commits. Git runs locally on your machine, tracking changes even without an internet connection.

#### 1.15 Key Git Concepts
**Staging** is the process of selecting which changes to include in the next commit — you might have changed five files but only want to save three of them as one logical change. The **commit message** is a short description of what changed and why ("Fix workout card layout for narrow browser windows"). Good commit messages are invaluable for understanding a project's history. **Branches** allow parallel lines of development — a developer can work on a new feature in a separate branch without affecting the main codebase. When the feature is ready, the branch is **merged** back into the main branch. Branches let multiple people work on different things simultaneously without interfering with each other.

#### 1.16 GitHub and Remote Repositories
Git tracks history locally, but teams need to share their work. **GitHub** (and similar platforms like GitLab and Bitbucket) hosts repositories in the cloud, making them accessible to the entire team. **Pushing** sends your local commits to the remote repository. **Pulling** downloads new commits from the remote to your local machine. A **pull request** (PR) is a proposal to merge changes from one branch into another — it's where team members review each other's work, discuss changes, and approve or request modifications before the code is merged. Pull requests are a critical collaboration tool and the primary way changes enter a production codebase.

#### 1.17 .gitignore: Keeping Secrets and Clutter Out
Not everything in a project folder should be tracked by Git. **`.gitignore`** is a special file that tells Git which files and folders to ignore. Common entries include: `.env` files (which contain secrets like API keys and database passwords), `node_modules/` (a folder of downloaded dependencies that can be regenerated), build output, and operating system files. Forgetting to add sensitive files to `.gitignore` is a common and dangerous mistake — once a secret is committed to Git, it lives in the repository's history even after the file is deleted. This concept connects directly to the security topics in Module 4.

**Part D: How the Web Works** *(sections 1.18–1.21 — clients, servers, URLs, ports, and the journey of a web request)*

#### 1.18 The Client-Server Model: How the Web Works
Every web application is a conversation between two kinds of computers. The **client** is the user's computer running a web browser. The **server** is a remote computer that stores the application's data and logic. When you use FitCheck, your browser (the client) sends requests to FitCheck's server, which processes them and sends responses back. The browser then displays those responses as the pages you see. This back-and-forth — request and response — is the fundamental rhythm of the web. Everything in this course, from frontend rendering to API calls to database queries, happens within this client-server conversation.

#### 1.19 URLs: The Addresses of the Web
Every resource on the web has a **URL** (Uniform Resource Locator) — a structured address that tells the browser exactly where to go and what to ask for. A URL like `https://fitcheck.app/api/workouts/today?unit=metric` has distinct parts: the **protocol** (`https://`) specifies *how* to communicate (securely, in this case), the **domain** (`fitcheck.app`) identifies *which server* to contact, the **path** (`/api/workouts/today`) specifies *what resource* is being requested, and the **query parameters** (`?unit=metric`) provide *additional details* about the request. Understanding URL structure helps students describe problems precisely — "the request to `/api/workouts` is returning all workouts instead of filtering" is far more useful than "the search doesn't work."

#### 1.20 Ports: Apartment Numbers for Services
A single server can run multiple services simultaneously — a web application, a database, an admin dashboard. **Ports** are how the server keeps them separate. Think of the server's IP address as a building address and ports as apartment numbers: the web application might live on port 3000, the database on port 5432, and the admin dashboard on port 8080. When FitCheck runs locally during development, students access it at `localhost:3000` — that means "this computer, apartment 3000." Port mismatches are a common deployment bug (the Module 5 bug scenario involves the container listening on port 3000 while the deployment expects port 8080), so understanding what ports are helps students diagnose connection failures.

#### 1.21 How a Web Request Travels
When a student opens FitCheck in their browser, a chain of events unfolds in milliseconds. The browser reads the URL and uses **DNS** to translate the domain name into a server's numeric address. It opens a connection to that server on the specified port. It sends an **HTTP request** (a structured message asking for something — more on this in Module 3). The server receives the request, processes it (running backend logic, querying the database, maybe calling the weather API), and sends back an **HTTP response** containing the data or page the browser requested. The browser then renders that response as the page the user sees. Understanding this chain — even at a high level — helps students identify *where* in the journey something went wrong: is the request not reaching the server? Is the server failing to process it? Is the response coming back wrong?

### The Bug: "I Can't Find My Changes"

Students receive a version of FitCheck where they need to get oriented with the development environment and Git:

- A teammate made a change to the workout dashboard yesterday but it's not showing up in the student's local copy — they need to use the AI assistant to learn how to pull the latest changes from the remote repository
- The student is asked to make a small configuration change (updating the app's display name in a settings file), but when they check the project status, Git shows dozens of untracked files in the `node_modules/` folder cluttering the output — the `.gitignore` file is missing its entry for `node_modules/`
- After fixing the `.gitignore` issue, the student uses the AI assistant to stage their changes, write a clear commit message, and push their first commit

Students learn to navigate the project, understand its structure, and use Git through conversation with the AI assistant — establishing the workflow pattern for the rest of the course.

### Learning Outcomes

- Describe FitCheck's architecture at a high level: what the frontend, backend, databases, APIs, and deployment pipeline each do
- Trace a user action (e.g., logging in, generating a workout) through the full system from browser to database and back
- Navigate the terminal using essential commands (pwd, ls, cd, mkdir, clear)
- Run, stop, and manage applications from the terminal (npm install, npm start, npm test, Ctrl+C)
- Read terminal output to distinguish successful operations from errors
- Explain what dependencies are and how npm and package.json manage them
- Navigate a project's folder structure and identify where frontend, backend, and configuration files live
- Read project documentation (README, inline comments, API docs) to find answers before asking for help
- Explain what version control is and why it matters for software projects
- Understand core Git concepts: repositories, commits, branches, merging, and pull requests
- Use `.gitignore` to prevent sensitive or unnecessary files from being tracked
- Describe the client-server model and explain how a web request travels from browser to server and back
- Identify the parts of a URL and explain what ports are and why they matter
- Apply a systematic debugging methodology: reproduce, isolate, check the simplest explanation, change one thing at a time, verify
- Establish the Observe → Describe → Interpret → Verify workflow with an AI coding assistant
- Recognize when an AI assistant may be guessing, push back on suspicious suggestions, and undo changes when a fix makes things worse

---

## Module 2: Frontend & User Interface

This is the most visual module in the course. Everything you learn here is something you can see and interact with directly in the browser — broken layouts, stuck loading spinners, buttons that don't respond. Remember the Observe step from Module 1's ODIV loop? In this module, you'll practice it by describing *visual* differences — what you see on screen versus what you expected to see. You'll learn to describe those observations with enough precision that an AI assistant can fix the problem, and you'll use browser developer tools to gather evidence before asking for help.

### Theory Topics

#### 2.1 The Three Layers of a Web Page
Every web page is built from three technologies working together. **HTML** provides structure and meaning — headings, paragraphs, buttons, forms, and images. It's the skeleton. **CSS** controls presentation — colors, fonts, spacing, layout, and how elements respond to different screen sizes. It's the skin and clothing. **JavaScript** adds behavior — what happens when a button is clicked, how data appears dynamically, and how the page responds to user actions. It's the nervous system. Students learn to recognize which layer is likely responsible for a given visual or behavioral problem.

#### 2.2 Components and Modern UI Architecture
Modern web applications aren't built as single monolithic pages. They're assembled from **components** — reusable, self-contained building blocks. A workout card, a weather widget, a navigation bar — each is a component that manages its own appearance and behavior. The FitCheck dashboard is composed of dozens of these components nested together. Understanding this architecture helps students describe *where* a problem is occurring ("the workout card component" rather than "somewhere on the page").

#### 2.3 State: The Data Behind What You See
What a user sees on screen depends on **state** — data that changes over time. Think of a scoreboard at a sporting event: the board itself doesn't change, but the numbers on it do — the score, the time remaining, who has possession. The scoreboard is the UI; the numbers are the state. When the score changes, the board updates. If the wrong score is displayed, the problem isn't the board — it's the data feeding it. State in a web application works the same way. Is the user logged in? What workouts are loaded? Is a form being submitted? State drives rendering: when state changes, the UI updates to reflect it. Many frontend bugs are actually state bugs — the data behind the interface is wrong, missing, or out of sync, causing the display to break. Students learn to think about what data is (or isn't) flowing into a component.

#### 2.4 Responsive Design and Layouts
Users don't always browse with their window at full width. **Responsive design** means the layout adapts when the browser window is resized — wider windows might show workout cards side by side, while narrower windows stack them vertically. CSS layout systems like Flexbox and Grid control how components arrange themselves — in rows, columns, or grids. Students can test this themselves by simply dragging the edge of their browser window to make it narrower or wider and watching how the layout responds. When layouts break at certain sizes, it's usually a CSS issue related to how elements are sized and positioned relative to each other and the viewport.

#### 2.5 Asynchronous Operations: Waiting for Data
When FitCheck's dashboard loads, it doesn't have all the information it needs immediately. It has to *ask* for data — from the backend, from the weather API, from the database — and those requests take time. This is **asynchronous** behavior: the application starts doing something, continues with other work, and handles the result when it arrives. Think of it like sending a text message — you don't freeze and stare at your phone until the reply comes; you put it down, do something else, and respond when the notification arrives. In FitCheck, the dashboard might render its layout immediately but show "Loading..." for the weather widget while it waits for the weather API to respond. Many frontend bugs are timing bugs: the page tries to display data that hasn't arrived yet, two requests come back in an unexpected order, or a loading state never resolves because the request failed silently. When students see a spinner that never stops or data that briefly flashes and disappears, the problem is often asynchronous — the app didn't handle the *waiting* correctly. Learning to describe these problems ("the weather widget starts loading but never finishes" vs. "the weather widget is broken") helps the AI assistant diagnose timing-related issues.

#### 2.6 Accessibility: Building for Everyone
Not all users interact with FitCheck the same way. Some users navigate entirely with a keyboard because they can't use a mouse. Some use **screen readers** — software that reads the page aloud — because they can't see the screen. Some have color vision differences that make certain color combinations indistinguishable. **Accessibility** (often abbreviated as **a11y**) means designing software so that it works for people with a wide range of abilities. Practical accessibility includes: using proper HTML elements so screen readers can understand the page structure (a button should be a `<button>`, not a styled `<div>`), providing text descriptions for images, ensuring sufficient color contrast between text and backgrounds, making all interactive elements reachable by keyboard, and showing clear focus indicators so keyboard users know where they are on the page. Accessibility isn't an add-on or a nice-to-have — in many jurisdictions it's a legal requirement, and it's always an ethical one. Students learn to ask the AI assistant to check for accessibility issues and to describe accessibility requirements when requesting UI changes: "Make sure this new button is keyboard-accessible and has an aria-label for screen readers."

#### 2.7 Browser Developer Tools as an Observation Layer
Every browser includes built-in developer tools that let anyone inspect what's happening on a page — without reading code. Students learn to open DevTools, inspect elements to see their size and spacing, check the Console tab for error messages, and use the Network tab to see if data requests are succeeding or failing. DevTools can also help with the accessibility concepts from Section 2.6 — the Elements panel shows whether elements have proper aria-labels, and Chrome's built-in accessibility audit (Lighthouse) can flag contrast issues and missing labels automatically (other browsers like Firefox and Safari offer similar accessibility tools). This becomes their primary "observation instrument" for describing problems to the AI assistant. The Network tab, in particular, will be essential in Module 3, where students trace API calls between the frontend and backend.

### The Bug: "My Dashboard Looks Broken"

Students receive a version of FitCheck where the dashboard has visual and behavioral issues:

- The Recent Workouts cards overlap and become unreadable when the browser window is resized to a narrower width — a CSS responsive design issue where the `@media` query for smaller screens has been removed
- The weather widget shows "Loading..." permanently and never displays actual weather data — an asynchronous operation that never resolves, connecting directly to the concepts in Section 2.5
- The "Add Workout" button appears clickable but nothing happens when pressed — and this is the first opportunity to practice the skills from Section 1.6 (When the AI Assistant Gets It Wrong). When students describe the non-responsive button, the assistant may initially suggest the problem is a missing click handler in the JavaScript — a plausible guess, but wrong. Students learn to verify by asking the assistant to check the actual file, at which point the real cause emerges (the button is styled to look interactive but is actually a non-clickable `<div>` element). This reinforces the habit of pushing back when a suggestion doesn't match the evidence

Students use the AI coding assistant to describe what they observe, investigate the likely causes using browser DevTools, and work with the assistant to apply fixes. They never edit code directly — they describe the problem, evaluate the assistant's suggestions, and ask the assistant to implement changes.

### Learning Outcomes

- Distinguish between structure (HTML), presentation (CSS), and behavior (JavaScript) issues
- Recognize asynchronous operations and describe timing-related bugs (loading states, missing data, failed requests)
- Identify basic accessibility requirements and ask an AI assistant to check for and fix accessibility issues
- Use browser developer tools to gather diagnostic information
- Describe visual and interactive bugs in precise, actionable language to an AI assistant
- Understand the concept of components and state in modern web applications

---

### Mid-Course Vocabulary Check

Before moving into the backend, APIs, and databases, here are the key terms you should be comfortable with from Modules 1 and 2. Try explaining one or two of these terms in your own words — if you can describe the concept without looking back, you've got it. If not, revisit the relevant section before continuing.

**From Module 1:** terminal, command line, dependencies, npm, package.json, node_modules, repository, commit, branch, merge, pull request, push, pull, .gitignore, client-server model, URL, port, localhost, HTTP request/response, DNS.

**From Module 2:** HTML (structure), CSS (presentation), JavaScript (behavior), component, state, responsive design, asynchronous operation, accessibility (a11y), browser DevTools, Console tab, Network tab.

These terms will be used freely from this point forward — they're now part of your working vocabulary.

---

## Module 3: Backend & APIs — The Logic and Connections

This is the module where many students feel the biggest shift in confidence. In Module 2, you practiced the Observe step by describing what you *saw* on screen. In Module 3, you'll practice it by reading what the *network* tells you — request URLs, status codes, and response data that reveal problems invisible to the naked eye. You'll trace failures that cross the line between frontend and backend — reading a Network tab, spotting a missing parameter, explaining why the backend couldn't possibly work with that request, and describing exactly what needs fixing. If you've ever wondered why a developer says "the API is returning a 500" or why a feature works on one screen but not another, you'll have the vocabulary to understand — and participate in — those conversations by the end of this module.

### Theory Topics

**Part A: How Systems Communicate** *(sections 3.1–3.7 — the language of APIs and data exchange)*

#### 3.1 What Is an API?
An **API** (Application Programming Interface) is a structured way for software systems to communicate with each other. Think of it as a service counter with a defined menu: the person at the counter (frontend) can't walk into the back room (server/database) and rummage around. Instead, they choose from a set of available requests — items on the menu — submit their order through the counter (the API), and receive a structured response. They don't need to know how the work is done behind the counter; they just need to know what they can ask for and what format the answer will come in. APIs define what requests are possible, what information must be included, and what the response will look like.

#### 3.2 The Request-Response Cycle
In Module 1, we saw that web communication is built on HTTP requests and responses. Here's the formal structure of that exchange. A **request** is sent from one system to another, containing: the **endpoint** (a specific URL representing a resource, like `/api/workouts`), the **method** (what action to perform), **headers** (metadata like authentication tokens), and optionally a **body** (data being sent). The receiving system processes the request and sends back a **response**, containing: a **status code** (a number indicating success or failure), **headers**, and a **body** (the requested data or confirmation).

#### 3.3 HTTP Methods as Intentions
HTTP methods map to intentions. **GET** means "give me data" (fetch workout history). **POST** means "create something new" (log a completed workout). **PUT** means "replace the entire resource" (send the user's complete updated profile to overwrite the existing one). **PATCH** means "update part of this" (change just the user's unit preference without resending their entire profile). **DELETE** means "remove this" (delete a saved workout). The distinction between PUT and PATCH matters: PUT replaces *everything*, so you must send all fields even if only one changed, while PATCH updates only the fields you include — modern APIs typically prefer PATCH for partial updates. Using the wrong method means the server may not understand the request or may handle it differently than intended.

#### 3.4 Status Codes as Standardized Signals
Every API response includes a numeric status code. The **200 range** means success (200 OK, 201 Created). The **400 range** means the client made an error (400 Bad Request, 401 Unauthorized, 404 Not Found). The **500 range** means the server encountered a problem (500 Internal Server Error, 503 Service Unavailable). These codes are a universal language — learning to interpret them helps students describe API problems precisely. Status codes also connect directly to the backend's error handling, covered later in this module: the backend decides which code to send based on what went wrong.

#### 3.5 Internal vs. External APIs
**Internal APIs** are the ones your own application defines — FitCheck's backend exposes endpoints that its own frontend calls. You control both sides. **External APIs** are services built and maintained by other companies — FitCheck calls OpenWeatherMap's API to get weather data. With external APIs, you depend on their documentation, their uptime, their rate limits, and their data format. If they change something, your app can break even though you changed nothing.

#### 3.6 API Keys, Rate Limits, and Documentation
External APIs typically require an **API key** — a unique identifier that authenticates your application and tracks your usage. **Rate limits** restrict how many requests you can make in a given time period (e.g., 60 requests per minute on a free plan). **API documentation** describes what endpoints exist, what parameters they accept, and what responses they return. Reading API docs is fundamentally the same skill as describing your needs to a coding assistant — both require precise, structured communication about data and behavior.

#### 3.7 JSON: The Language APIs Speak
Most modern APIs exchange data in **JSON** (JavaScript Object Notation) — a lightweight, human-readable format for structured data. For example, when FitCheck asks the OpenWeatherMap API for today's weather, the response might look something like: `{ "temperature": 78, "unit": "fahrenheit", "condition": "partly cloudy", "humidity": 45 }`. Each piece of data has a label (like "temperature") and a value (like 78), organized in a predictable structure using curly braces and colons. When students see an API response in the browser's Network tab, this is the format it will be in. Understanding that APIs send and receive structured data (not raw text or magic) helps demystify what's happening when the frontend talks to the backend or the backend talks to a weather service. This JSON data is what becomes the *state* of the frontend components from Module 2 — when the weather widget displays "78°F, partly cloudy," it's rendering the values from this JSON response. If the response is missing a key or has the wrong value, the frontend has nothing correct to display. This means students can spot problems at the source: if the response shows `"unit": "fahrenheit"` when the user requested metric, the bug is visible right there in the data, before it ever reaches the screen.

#### Putting It Together: A Request in Action
Before moving into Part B, let's trace a single request through all the concepts you've just learned. A user opens FitCheck and clicks "Add Workout." The frontend sends a **POST** request to the endpoint `/api/workouts` with the user's authentication token in the **headers** and a **JSON body** containing the workout data (type, date, duration, location). The backend receives this request, checks the token (authentication), validates the data (is the date not in the future? is the type valid?), stores the workout in the PostgreSQL database, and sends back a **201 Created** response with the saved workout data. The frontend takes that JSON and updates the Recent Workouts section and Total Workouts counter. If any link in this chain breaks — wrong endpoint, missing parameter, invalid data, bad JSON — the user sees an error. The rest of this module teaches you how to identify *where* in this chain something went wrong.

**Part B: What the Backend Does** *(sections 3.8–3.17 — this is the densest section in the course; consider breaking it into two sittings, pausing after section 3.12)*

#### 3.8 The MVC Pattern: A Map of the Whole System
Students have now encountered the frontend (Module 2) and the APIs that connect systems. There's a widely used architectural pattern that describes how these pieces relate to each other: **MVC**, which stands for **Model-View-Controller**. The **Model** is the data layer — where persistent data lives (user profiles, workout history, community reviews). We'll explore schemas and database design in detail in Module 4. The **View** is the presentation layer — the HTML/CSS/JavaScript frontend that users see and interact with (Module 2). The **Controller** is the backend logic that sits between them — it receives requests from the view, decides what to do (applying business rules, calling external services), interacts with the model to get or store data, and sends a response back to the view. The controller is the focus of this part of the module. MVC isn't a rigid rule — real applications don't always split perfectly into three clean layers — but it's a powerful mental model for understanding where different kinds of bugs live. A display problem is likely in the view. A data problem is likely in the model. A logic or orchestration problem is likely in the controller. When describing issues to an AI assistant, framing the problem in terms of which layer is misbehaving helps the assistant narrow its search immediately.

#### 3.9 The Backend as Orchestrator
The backend is the controller in the MVC pattern — the decision-maker between the user interface and the data. When a user clicks "Add Workout" on FitCheck, the frontend (view) sends a request to the backend (controller), which then: validates the request (is this a real user? is the date valid? is the workout type one of the accepted values?), stores the workout in the database (model), and sends a response back to the view. For the weather widget, the backend calls the OpenWeatherMap external API. The backend orchestrates all of these systems on behalf of the user.

#### 3.10 Separation of Concerns: Each Piece Does One Job
As software grows, one change can break something unrelated, and bugs hide in unexpected places. **Separation of concerns** is the design principle that prevents this: each piece of the system should handle one responsibility and not mix unrelated tasks together. In FitCheck, the weather service should *only* handle weather data — it shouldn't also manage user preferences. The authentication middleware should *only* check whether the user is logged in — it shouldn't also calculate calories. The workout display component should *only* render the plan — it shouldn't also fetch data from the database. When concerns are properly separated, bugs are easier to locate (a display problem is in the display layer, not tangled into the data layer), changes are safer to make (updating the weather service won't accidentally break the login flow), and the system is easier to describe to an AI assistant ("the problem is in the weather service" rather than "something is wrong somewhere"). When students encounter tangled code where multiple responsibilities are mixed together, they can ask the AI assistant: "Can you separate the weather logic from the notification logic so they don't affect each other?"

#### 3.11 Routes and Endpoints
In the first part of this module, we learned about API endpoints and HTTP methods from the *caller's* perspective. Routes are the other side of that coin — the backend's implementation of those endpoints. A backend application defines **routes** — mappings between URLs and the logic that handles them. When the frontend makes a request to `/api/workouts/today`, the backend's routing system directs that request to the specific function responsible for generating today's workout. Routes are organized to reflect the application's resources: `/api/users` for user operations, `/api/workouts` for workout operations, `/api/reviews` for community reviews. A misconfigured route means requests go to the wrong handler — or nowhere at all.

#### 3.12 Middleware: The Pipeline
Before a request reaches its final handler, it passes through a series of **middleware** functions — a processing pipeline. Think of it like an airport security line: before you reach your gate, you pass through several checkpoints in a specific order — show your boarding pass, place your bag on the scanner, walk through the metal detector. Each checkpoint handles one concern and either lets you through or stops you. Skip a checkpoint or put them in the wrong order, and the system breaks down. Middleware works the same way. Each middleware handles one concern: one checks authentication (is this user logged in?), another logs the request (for debugging and monitoring), another parses the request body (converting raw data into a usable format), another handles CORS (is this frontend allowed to talk to this backend?). Middleware runs in the order it's defined, and that order matters: if middleware X depends on data set by middleware Y, then Y must run first. Reverse the order and X receives incomplete or missing data. Each middleware can either pass the request along or stop it. A misconfigured or missing middleware can cause authentication to be skipped, data to arrive unparsed, or requests to be silently rejected.

*Checkpoint: You now understand how requests travel from the frontend through the API layer, how HTTP methods and status codes communicate intent and outcome, how JSON carries data between systems, and how the middleware pipeline processes each request before it reaches its handler. Take a break here if you need one. Sections 3.13–3.17 cover business rules, error handling, logging, and observability — high-value material, but heavier going.*

#### 3.13 Business Logic and Validation
**Business logic** is the set of rules that make FitCheck more than just a database viewer. Rules like: "Don't allow logging a workout for a future date," "The workout type must be one of cardio, strength, or endurance," "A workout for a date that already has one should overwrite the previous entry." **Validation** ensures incoming data is sensible before processing it: is the date in the right format? Is the workout duration a positive number? Is the workout type one of the accepted values? Input validation at the API boundary is also a security concern — checking that data is the right type, length, and format before processing it prevents many attacks. Bugs in business logic or validation cause the app to make wrong decisions or accept garbage data.

#### 3.14 Environment Variables and Configuration
The same backend code runs in different contexts: a developer's laptop, a test server, and the live production server. **Environment variables** let the code behave differently in each context without being modified. The database connection string, the API key for OpenWeatherMap, the secret used to sign authentication tokens, the debug mode flag — all of these should be environment variables, not hardcoded values. When environment variables are missing or misconfigured, the backend may connect to the wrong database, fail to authenticate with external services, or expose debug information in production.

#### 3.15 Error Handling: Failing Gracefully
Things go wrong: the database is temporarily unavailable, the weather API returns unexpected data, a user sends a malformed request. **Error handling** determines what happens next. This is where the HTTP status codes from earlier in this module get produced — the backend's error handling logic decides whether to send a 400 (your request was wrong), a 404 (that resource doesn't exist), or a 500 (something broke on our end). Good error handling means: the user sees a helpful message ("Weather data is temporarily unavailable, using your default preferences"), the developer sees a detailed log (the exact error, the request that caused it, a timestamp), and the app continues running for other users. Bad error handling means: the app crashes, the user sees a raw stack trace, or errors are silently swallowed and nobody knows something is wrong.

#### 3.16 Stack Traces: Reading the Breadcrumb Trail
When an application crashes or encounters an error, it typically produces a **stack trace** — a detailed report showing the exact sequence of steps the program was executing when things went wrong. Think of it as a trail of breadcrumbs leading to the crash site. A stack trace reads from top to bottom: the **error message** at the top tells you *what* went wrong ("Cannot read property 'temperature' of undefined"), the **top lines of the trace** show *where* it happened (which file and which line), and the **deeper lines** show the chain of calls that led there. Students don't need to understand every line — the key skill is recognizing the error message and the most relevant file location. More importantly, students learn that a stack trace is one of the most valuable things they can share with an AI coding assistant. Pasting the full trace into the conversation — rather than paraphrasing "it crashed" — gives the assistant precise diagnostic information. A single stack trace often contains enough context for the assistant to identify the bug immediately.

#### 3.17 Logging and Observability
In production, you can't attach a debugger or watch the code execute line by line. **Logging** is how you understand what the backend is doing. Structured logs record what happened, when, and in what context: "User 42 requested today's workout at 2:43 PM, weather API returned 78°F partly cloudy, generated a 45-minute outdoor cycling plan." **Log levels** indicate severity: **debug** for detailed developer information, **info** for normal operations, **warn** for concerning but non-fatal situations, and **error** for things that need immediate attention. Without logging, diagnosing production issues is like solving a mystery with no evidence. **Observability** extends this to metrics (how many requests per second?), traces (how long did each step take?), and alerts (notify the team when error rates spike).

### The Bug: "The Weather Is Wrong and My Workouts Won't Save"

*If an API fix breaks the frontend, you'll see it immediately in the browser. If it breaks the backend, the Network tab shows you the error response. Unlike bugs buried in hidden systems, API problems announce themselves — and every change is reversible through Git.*

Students receive a version of FitCheck with issues that span APIs and backend logic. Remember the service counter from Section 3.1? These bugs are what happen when the order gets lost, comes back wrong, or the kitchen crashes mid-preparation. Start with the most concrete, observable problem:

- The weather widget on the dashboard always shows the temperature in Fahrenheit regardless of the user's preference setting. Open the browser's Network tab, find the `/api/weather` request, and describe to the AI assistant what's wrong. This is the most straightforward bug in the scenario — the weather controller is hardcoding `units=imperial` instead of reading the user's unit preference
- Next, students try to log a workout and it fails — the middleware that loads user preferences runs *after* the workout routes instead of *before* them, so the workout controller can't access `req.userPrefs.location` and crashes. Students describe the symptom to the AI assistant ("I click Add Workout and get an error"), and the assistant traces the problem to the middleware pipeline ordering in `app.js`
- When the OpenWeatherMap API is temporarily unreachable (due to network issues or a bad API key), the entire weather section shows "Service Unavailable" instead of falling back gracefully to default weather data. The weather service's `catch` block has been removed, so any API failure crashes the endpoint. Students learn that robust error handling isn't optional — it's what keeps one failure from cascading into a broken user experience

Students use the browser's Network tab and the AI assistant to trace the request-response flow through both the API layer and the backend logic, identifying where communication fails and where middleware ordering matters. Before applying any suggestion, check: does the assistant's explanation match what you observed in the Network tab? If not, push back — the evidence you gathered is more reliable than a plausible guess.

### Learning Outcomes

- Explain the request-response cycle and identify the components of an API call
- Match HTTP methods (GET, POST, PATCH, PUT, DELETE) to their intended actions
- Interpret HTTP status codes (200s, 400s, 500s) to quickly categorize whether a problem is client-side or server-side
- Distinguish between internal and external APIs and the different challenges each presents
- Explain what API keys and rate limits are and why external API errors require graceful handling
- Recognize JSON as the standard data format for API communication
- Use the browser Network tab to observe API calls and their responses
- Describe the MVC pattern and identify which layer (model, view, or controller) a given bug likely belongs to
- Apply the principle of separation of concerns to identify when responsibilities are improperly tangled
- Understand routes, middleware, and the request processing pipeline
- Explain what validation is and why rejecting bad input early prevents downstream bugs
- Distinguish between good error handling (helpful user messages, detailed logs) and bad error handling (crashes, swallowed errors)
- Read a stack trace at a high level and share it effectively with an AI assistant for diagnosis
- Interpret log output and use log levels (debug, info, warn, error) to assess severity
- Describe API misbehaviors and business logic bugs to an AI assistant with specificity (wrong endpoint, missing parameter, incorrect method, broken rule, pipeline ordering)

### Vocabulary Check: Modules 1–3

**From Module 3 — APIs & Communication:** API, endpoint, request, response, HTTP method (GET, POST, PATCH, PUT, DELETE), status code (200s, 400s, 500s), headers, body, API key, rate limit, JSON, internal API, external API.

**From Module 3 — Backend:** MVC (model, view, controller), route, middleware, business logic, validation, environment variable, error handling, stack trace, log level (debug, info, warn, error), observability.

These join the Module 1 and 2 vocabulary you've already consolidated. Pick two or three terms and try explaining them in your own words — if you can describe the concept clearly, you're ready to move on. If not, revisit the relevant section before continuing.

---

## Module 4: Databases & Security — Storing and Protecting Data

What stops someone from reading your users' personal health data? What happens when a database change goes wrong and workout history disappears? This module covers the two things that make or break user trust: keeping their data safe and keeping it accurate. If you've ever seen a headline about a data breach or a company losing customer records, the concepts in this module explain exactly what went wrong — and how to prevent it.

### Theory Topics

**Part A: Persistent Storage** *(sections 4.1–4.6 — how data is organized and stored)*

#### 4.1 Why Applications Need Persistent Storage
When a server restarts or a user closes the browser, what happens to their data? Without a database, everything disappears. **Persistent storage** means data survives beyond a single session. FitCheck needs to remember user profiles, workout history, and community reviews. The database is the application's long-term memory.

#### 4.2 Relational Databases and SQL
A **relational database** (like PostgreSQL) organizes data into **tables** with defined **columns** and **rows**. Think of it like a collection of carefully designed spreadsheets. Each table has a **schema** — a contract that specifies what columns exist, what type of data each holds (text, numbers, dates), and which fields are required. **Primary keys** uniquely identify each row. **Foreign keys** create relationships between tables — for example, a workout record references a user ID, linking it to the person who completed it. **SQL** (Structured Query Language) is the standard language for querying and modifying relational databases.

#### 4.3 NoSQL and Document Databases
Not all data fits neatly into rigid tables. A **document database** (like MongoDB) stores data as flexible **documents** — structured objects that can vary from one entry to the next. In FitCheck, user reviews are a good fit for a document store: one review might include photos and a star rating, while another might include a detailed text breakdown and tags. **Collections** are groups of related documents (analogous to tables). Document databases trade the strict guarantees of relational databases for flexibility and ease of evolution.

#### 4.4 CRUD Operations
Nearly every interaction with a database falls into four categories: **Create** (add new data), **Read** (retrieve existing data), **Update** (modify existing data), and **Delete** (remove data). These operations are what change the underlying data that drives the frontend state we discussed in Module 2 — when a user logs a workout (Create), the dashboard's state updates to reflect it. Understanding CRUD helps students describe database problems precisely — "the app creates the workout record but the user's name field is empty" is much more useful than "the database is broken."

#### 4.5 Migrations and Schema Evolution
Database structures change over time as the application evolves. A **migration** is a managed, versioned change to the database schema — adding a new column, renaming a table, changing a data type. Migrations must be applied in order, and a missing or failed migration is a common source of bugs. If the application code expects a column that doesn't exist yet in the database, things break.

#### 4.6 Data Integrity and Constraints
Databases can enforce rules about data quality. **Constraints** include: required fields (a workout must have a date), unique values (no two users can have the same email), valid ranges (a rating must be between 1 and 5), and referential integrity (you can't log a workout for a user that doesn't exist). When constraints are missing or misconfigured, invalid data can slip in and cause subtle bugs downstream. These constraints are the data layer's counterpart to the input validation we covered at the API boundary in Module 3 — both serve as quality checks, but at different points in the data's journey.

**Part B: Protecting Users and Data** *(sections 4.7–4.15 — conceptually dense; consider pausing after section 4.10 before tackling vulnerabilities and endpoint security)*

#### 4.7 The Threat Model Mindset
Security begins with three questions: **What are we protecting?** (user passwords, workout data, personal health information). **From whom?** (malicious users, automated bots, insider threats). **What happens if we fail?** (privacy violations, account takeovers, legal liability). This mindset — thinking about what could go wrong before it does — is the foundation of secure software design. Students learn to evaluate any feature by asking "how could this be abused?"

#### 4.8 Authentication vs. Authorization
These terms are often confused but represent two distinct concepts. **Authentication** answers "Who are you?" — it's the login process, proving your identity with credentials. **Authorization** answers "What are you allowed to do?" — once we know who you are, what features and data can you access? In FitCheck, authentication is the login screen. Authorization is the rule that says you can view *your own* workout history but not someone else's. Many security bugs are authorization failures — the app knows who you are but doesn't properly restrict what you can see or do. Crucially, authorization must be checked on *every endpoint for every resource*, not just at login. Being authenticated doesn't automatically mean you're authorized to access a specific piece of data — the backend must verify, for each request, that *this* user is allowed to access *this* resource. A common mistake is checking that a user is logged in but never checking whether the workout history they're requesting actually belongs to them.

#### 4.9 Password Security and Hashing
Storing passwords in plain text is one of the most dangerous mistakes in software. If the database is ever compromised, every user's password is exposed. **Hashing** transforms passwords into irreversible scrambled strings using specialized one-way algorithms designed specifically for passwords, such as **bcrypt** or **Argon2** (not general-purpose algorithms like SHA-256, which are too fast and vulnerable to brute-force attacks). These algorithms are deliberately slow by design — if hashing were fast, an attacker could guess millions of passwords per second, but bcrypt and Argon2 make each guess computationally expensive, making brute-force attacks infeasible even with powerful hardware. When a user logs in, the app hashes their input and compares it to the stored hash — it never needs to know the actual password. **Salting** adds a random value to each password before hashing, ensuring that two users with the same password end up with different hashes. Students learn why this matters through a concrete scenario: what happens to FitCheck's users if the database leaks?

#### 4.10 Tokens and Sessions
After a user logs in, the app needs to remember that they're authenticated as they navigate from page to page. This is handled through **sessions** (server-side records of who's logged in) or **tokens** (encoded strings that the client stores and sends with each request, commonly as JWTs — JSON Web Tokens). Tokens contain encoded information like user ID and expiration time. Important: the information in a token is encoded but *not encrypted* — anyone with the token can read its contents, so passwords and sensitive secrets should never be stored in tokens. Security bugs around tokens include: tokens that never expire, tokens that aren't validated on the server, or tokens that leak sensitive information. The middleware pipeline we learned about in Module 3 is where token validation typically happens — one middleware function checks the token before the request reaches its handler.

*Checkpoint: You now understand authentication (proving who you are), authorization (what you're allowed to do), password hashing (why plain text is dangerous), and tokens (how the app remembers you're logged in). Sections 4.11–4.15 build on these foundations to cover specific vulnerabilities and defenses. This is high-value, security-critical material — take a break if you need one.*

#### 4.11 Common Vulnerabilities (OWASP Top 10 Overview)
The **OWASP Top 10** is a widely recognized list of the most critical web application security risks. Key items relevant to FitCheck include: **Injection attacks** — when user input is treated as a command (someone enters a malicious string in the search bar that gets executed as a database query). **Broken access control** — when users can access resources or perform actions they shouldn't be able to. **Security misconfiguration** — default settings, exposed debug information, or unnecessary services left running. **Sensitive data exposure** — personal health data transmitted without encryption or stored without protection.

#### 4.12 HTTPS and Encryption
**Encryption in transit** (HTTPS) protects data as it travels between the user's browser and the server — without it, anyone on the same network could read the data. **Encryption at rest** protects data stored in the database — if the hard drive is stolen, the data is unreadable. For a fitness app handling personal health information, both are essential. Students learn the difference between these two and when each applies.

#### 4.13 Secrets Management and Hardcoded Credentials
A **secret** is any piece of sensitive information that grants access to a system: API keys, database passwords, token signing keys, third-party service credentials, and encryption keys. **Hardcoding** secrets — writing them directly into the source code — is one of the most common and dangerous security mistakes in software. Hardcoded secrets end up in version control systems like Git, where they become visible to anyone with access to the repository (and often remain in the history even after deletion). They can't be rotated without changing and redeploying the code. If the codebase is ever leaked or made public, every hardcoded secret is instantly compromised. The proper approach is to store secrets in **environment variables**, **secrets managers** (like AWS Secrets Manager or HashiCorp Vault), or **`.env` files** that are explicitly excluded from version control via `.gitignore` — the same `.gitignore` mechanism we learned in Module 1 and the same environment variable system we covered in Module 3. Students learn to recognize hardcoded credentials as a red flag and to ask AI assistants to audit code for exposed secrets.

#### 4.14 The Principle of Least Privilege
Every user, every component, and every service should have the minimum level of access necessary to perform its function. A user shouldn't have admin access. The workout display page shouldn't have permission to delete accounts. The weather API integration shouldn't have access to user passwords. When systems are designed with broad permissions "for convenience," a single vulnerability can cascade into a full compromise.

#### 4.15 Securing Your Own API Endpoints
Module 3 covered how APIs and the backend process requests. This section addresses how to make those systems *safe*. Every endpoint your application exposes is a potential attack surface. **Input validation** means checking that data sent to an endpoint is the right type, length, and format before processing it — similar to the data integrity constraints discussed earlier in this module, but enforced at the API boundary rather than the database. A workout duration should be a positive number, not a script tag. **Rate limiting** restricts how many requests a single user or IP address can make in a given time period, preventing abuse like brute-force login attempts or someone flooding the workout generator with thousands of requests. **CORS (Cross-Origin Resource Sharing)** controls which websites are allowed to make requests to your API. Browsers enforce a **Same-Origin Policy** by default: a page loaded from `example.com` cannot make requests to `fitcheck.app` unless FitCheck's server explicitly grants permission. CORS headers are how the server says "I trust requests from this specific frontend." Without proper CORS configuration, a malicious site could attempt to make requests to FitCheck's backend on behalf of a logged-in user. **Authorization on every endpoint** means that even if a user is authenticated, each endpoint must independently verify that the user is allowed to perform the requested action on the requested resource — not just trust that authentication alone is sufficient. Students learn to think about each endpoint as a door that needs its own lock, not just the front door of the building.

### The Bug: "My Data Disappeared and I Can See Someone Else's Workouts"

*Database changes can feel higher-stakes because data is "real." But these bug scenarios run on a development copy — nothing here affects production. More importantly, database migrations are reversible: if you apply one and realize it's wrong, you can roll it back. Ask the AI assistant before applying any change you're unsure about.*

Students receive a version of FitCheck with intertwined data and security issues:

- Users can create new workout entries, but when they view their workout history, the city name never appears — even though they selected a location during logging. Investigation reveals a missing database migration that was supposed to add the `location` column to the workouts table
- The workout model references a column called `workout_type` when the actual column is named `type`, causing a database error whenever a user tries to log a workout — the schema doesn't match what the code expects
- After fixing the data issues, students ask the AI assistant to perform a security review of the application. The assistant flags three problems: any logged-in user can view any other user's workout history by simply changing the user ID in the URL — there's no authorization check on the workout history endpoint, and the `authorize` middleware has been removed from the PATCH and DELETE routes too; passwords are being stored in the database as plain text instead of being hashed; and the OpenWeatherMap API key is hardcoded directly in the backend source code rather than stored in an environment variable — meaning it's visible to anyone with access to the repository and has been committed to the Git history, where it persists even if later removed from the file

Students work with the AI assistant to investigate the data flow, identify schema mismatches and missing migrations, then request a security audit that uncovers the authorization failure, password storage vulnerability, and exposed API key. They work with the assistant to implement proper protections — including moving the hardcoded API key to an environment variable and adding a `.gitignore` rule to prevent `.env` files from being committed. Notice how this single fix connects three concepts from across the course: `.gitignore` from Module 1 (Section 1.17), environment variables from Module 3 (Section 3.14), and secrets management from this module (Section 4.13). Security fixes deserve extra scrutiny — before applying any suggestion the assistant makes, ask yourself: does this fix actually solve the vulnerability, or does it just hide it?

### Learning Outcomes

- Explain why applications need persistent storage and what happens without it
- Explain the difference between relational and document databases and when each is appropriate
- Describe data problems in terms of CRUD operations and schema expectations
- Understand migrations and recognize when a schema mismatch is the root cause
- Identify data integrity constraints (required fields, unique values, valid ranges) and recognize when missing constraints allow bad data
- Distinguish between authentication and authorization and identify failures of each
- Explain why passwords must be hashed and salted, not stored in plain text
- Describe how tokens and sessions maintain a user's logged-in state and recognize common token-related vulnerabilities
- Explain the difference between encryption in transit (HTTPS) and encryption at rest and when each applies
- Identify hardcoded secrets as a critical security red flag and explain proper secrets management practices
- Apply the principle of least privilege to evaluate whether a system's permissions are appropriately scoped
- Understand how to secure API endpoints through input validation, rate limiting, CORS, and per-endpoint authorization
- Recognize common vulnerabilities from the OWASP Top 10 in plain language
- Communicate database and security issues to an AI assistant using precise terminology (tables, columns, documents, collections, constraints, authorization, threat model)

### Vocabulary Check: Modules 1–4

**From Module 4 — Databases:** persistent storage, relational database (PostgreSQL), document database (MongoDB), table, column, row, schema, primary key, foreign key, SQL, document, collection, CRUD (create, read, update, delete), migration, constraint.

**From Module 4 — Security:** authentication, authorization, hashing (bcrypt, Argon2), salting, token (JWT), session, OWASP Top 10, injection, encryption in transit (HTTPS), encryption at rest, secret, environment variable, least privilege, CORS, Same-Origin Policy.

Try explaining one security term and one database term in your own words. You now have the full vocabulary for every layer of a web application. Module 5 adds the final piece: how to verify that it all works and get it to users.

---

## Module 5: Testing & Deployment — Shipping with Confidence

This is the moment your work reaches real users. Testing and deployment are where ideas become reality — and where most things go wrong for the first time. Here's a scenario every development team knows: you fixed a critical bug on Friday and the fix shipped to production. Monday morning, users report a completely different feature is now broken — because your change affected something you didn't realize was connected. This is the regression problem, and it's why testing exists. This module also covers what happens after code is written and tested: getting it from a developer's laptop to a server where real users can access it, and making sure it stays running once it's there.

### Theory Topics

**Part A: Making Sure It Works** *(sections 5.1–5.11 — starts with why testing matters, then introduces the core skill of describing expected behavior before building to test types and tools)*

#### 5.1 Why Testing Matters: The Regression Problem
Every change to software risks breaking something that was previously working. This is called a **regression**. In Module 4, we fixed a security bug. How do we know that fix didn't accidentally break the workout generator? **Automated tests** are scripts that verify expected behavior — they run every time code changes and immediately flag if something broke. Without tests, the only way to catch regressions is for a human to manually click through every feature after every change. Testing is what lets teams move fast without breaking things.

#### 5.2 What to Test: Behavior, Not Implementation
Good tests describe **what** the software should do, not **how** it does it internally. "When a user requests a workout on a rainy day, the response should only contain indoor exercises" is a behavioral test — it remains valid even if the internal code is completely rewritten. "The function calls `filterByLocation('indoor')` on line 47" is an implementation test — it breaks whenever the code is reorganized, even if the behavior is still correct. Students learn that describing desired behaviors is the key testing skill, and it's identical to the skill of working with AI coding assistants.

#### 5.3 Anatomy of a Test: Arrange, Act, Assert
Regardless of the testing level, every test follows the same three-step structure. **Arrange** sets up the conditions — create a test user with imperial preferences, set up a workout with a specific date and type. **Act** performs the action being tested — POST a new workout, submit the login form, request the workout history. **Assert** checks the result — the workout should be created with the right type, the login should succeed, the history should only contain the user's own workouts. This pattern gives students a concrete framework for describing tests to an AI assistant: "Set up a user with these characteristics, perform this action, and verify that the result is this." Understanding arrange/act/assert also helps students read and interpret test code that the assistant generates, even without writing it themselves.

#### 5.4 The Testing Pyramid
Not all tests are created equal. The **testing pyramid** describes three layers. **Unit tests** (the base, most numerous) verify individual pieces of logic in isolation — does the weather service return the correct fallback data when the API is unreachable? Does the validator correctly reject an invalid workout type? **Integration tests** (the middle) verify that components work together — for example, when a user POSTs a workout with a future date, does the controller correctly reject it with a 400 status? When one user tries to delete another user's workout, does the authorize middleware block it? Integration tests are the bridge between testing isolated logic and testing the full user experience. **End-to-end tests** (the top, fewest) simulate a real user's full journey — can a user log in, view their dashboard, add a workout, and see it appear in their history? This course focuses on unit tests and integration tests, but when describing tests to an AI assistant, you can reference any level: "Set up component A with this data, feed it into component B, and verify the combined result."

#### 5.5 Edge Cases and Boundary Conditions
Software often breaks at the edges. What happens when the weather API returns no data? When a user has zero workout history? When someone enters a negative number for workout duration? When the date crosses midnight during a workout? **Edge cases** are unusual but valid inputs or conditions. **Boundary conditions** are the points where behavior should change (e.g., the temperature threshold between recommending outdoor vs. indoor workouts). These are exactly the situations where the error handling we discussed in Module 3 becomes critical — if the code doesn't account for them, it crashes or produces wrong results. Thinking about edge cases is a critical skill for both testing and for communicating with AI assistants — "make sure it handles the case where..." is one of the most valuable prompts.

#### 5.6 Test-Driven Development as a Communication Framework
**Test-Driven Development (TDD)** follows a cycle: first describe what the software should do (write the test), then make it work (write the code), then clean it up (refactor). Even though students won't write tests themselves, the TDD mindset maps perfectly to the Observe → Describe → Interpret → Verify loop introduced in Module 1: first describe the expected behavior, then ask the assistant to implement it, then verify the result. "Before you fix this, let me describe what the correct behavior should be" is a powerful framing for AI-assisted development.

#### 5.7 Unit Tests in Practice
A **unit test** isolates a single piece of logic and verifies it works correctly. For FitCheck, unit tests might cover: does the weather service return the correct fallback when the API is unreachable? Does it return temperatures in Celsius when metric is requested? Does it return Fahrenheit when imperial is requested? Unit tests are fast (milliseconds each), numerous (dozens or hundreds), and narrowly focused. When a unit test fails, it points directly to the broken logic. Students learn to describe unit tests by specifying a single input, a single action, and a single expected output — and to ask the AI assistant to generate tests covering normal cases, edge cases, and error cases for a given function.

#### 5.8 End-to-End Tests in Practice
An **end-to-end (E2E) test** simulates a real user interacting with the full application — browser, frontend, backend, database, and external services all working together. Tools like Playwright or Cypress automate a browser to click buttons, fill forms, navigate pages, and verify what appears on screen. For FitCheck, an E2E test might: open the login page, enter credentials, verify the dashboard loads, check that the weather widget displays, click "Add Workout" with a valid date and type, and verify that the workout appears in the Recent Workouts section. E2E tests are slow (seconds to minutes each), few in number, and brittle (they can fail because of timing or layout changes), but they catch problems that no other test level can — the full chain of systems working together. Students learn to describe E2E tests as user stories: "A user who does X should see Y."

#### 5.9 Interpreting Test Results
Test output follows patterns. A **passing test** confirms that one expected behavior still works. A **failing test** tells you exactly what broke: what was expected, what was received, and where the discrepancy occurred. A **test error** means the test itself couldn't run — often due to setup problems rather than code bugs. Students learn to read test output as a diagnostic tool and to share relevant test failures with the AI assistant as precise descriptions of what went wrong.

#### 5.10 Test Runners, Test Files, and Test Suites
Tests don't run by themselves — they need a **test runner**, a tool that discovers test files, executes them, and reports results. In the JavaScript/Node.js world (FitCheck's stack), common test runners include the Node.js built-in test runner (`node:test`), Jest, and Vitest. Test files are typically organized alongside the code they test or in a dedicated `tests/` directory, following naming conventions like `weather.service.test.js`. A **test suite** is a group of related tests — all the tests for the weather service, or all the tests for the user authentication flow. Students learn to ask the AI assistant to run specific test suites ("run the weather service tests") and to interpret the structured output: which suite ran, how many tests passed, which failed, and why.

#### 5.11 Code Coverage: A Useful but Imperfect Metric
**Code coverage** measures what percentage of the application's code is exercised by tests. 80% coverage means 20% of the code has never been tested. Coverage is useful as a general indicator — if it's very low, important behaviors are definitely untested. But high coverage doesn't guarantee quality: a test can execute a line of code without actually checking that it produces the right result. Students learn to treat coverage as a conversation starter, not a finish line.

**Part B: Getting It to Users** *(sections 5.12–5.20 — from local development to production; good stopping point after section 5.15 before tackling CI/CD and monitoring)*

#### 5.12 The "It Works on My Machine" Problem
Development happens on a personal computer with specific software versions, configuration, and local services. **Deployment** is the process of making that application available to real users on a remote server. The challenge: the production environment is fundamentally different from the development environment. Different operating system, different installed software, different network configuration, different database instance. Deployment is about bridging this gap systematically rather than hoping for the best.

#### 5.13 Localhost: What "My Machine" Actually Means
In Module 1, we mentioned that developers access FitCheck locally at `localhost:3000`. Now it's time to understand why that address causes problems in production. **Localhost** is a special address that means "this computer, talking to itself" — it's the machine's way of referring to its own services. On a developer's laptop, `localhost` points to the database running on that laptop, the backend running on that laptop, and so on. This works perfectly during development. The problem comes at deployment: when the application runs on a production server, `localhost` now refers to *that server* — not the developer's laptop. A database connection string pointing to `localhost` worked in development because the database was on the same machine. In production, the database is on a *different* machine entirely — `localhost` still resolves to the production server itself, but the database isn't there, so the connection fails. This is one of the most common deployment failures, and understanding *why* it fails requires understanding what `localhost` means. The fix is never to hardcode `localhost` for services the app depends on — instead, use environment variables (as we learned in Module 3) that point to the correct address in each environment.

#### 5.14 Environments: Dev, Staging, Production
Professional software teams maintain multiple **environments**. **Development** is each developer's local machine — fast to iterate, safe to break. **Staging** is a replica of production used for final testing — it mirrors the real setup but with no real users. **Production** is the live system that real users interact with. Changes flow from Dev → Staging → Production. Skipping staging means bugs reach real users untested. Each environment has its own configuration: its own database, its own API keys, its own URL.

#### 5.15 Containers: Portable, Reproducible Environments
A **container** (typically Docker) packages an application along with everything it needs to run — code, runtime, libraries, configuration — into a single portable unit. Think of it as a shipping container for software: no matter what ship (server) carries it, the contents are the same. Without containers, deploying an application means carefully installing the right versions of every tool and library on the production server — and hoping they don't conflict with anything else running there. One application might need version 14 of Node.js while another needs version 18, and installing both on the same server creates conflicts. Containers eliminate this problem entirely: each application brings its own environment, isolated from everything else. This is why containers matter — they make the "works on my machine" problem disappear by ensuring the application runs in an identical environment everywhere. One important detail: a container has its own isolated networking, which means a port *inside* the container (say, port 3000 where the app is running) isn't automatically accessible from the outside. **Port mapping** connects an external port to the container's internal port — for example, mapping the host's port 8080 to the container's port 3000. If this mapping is wrong or missing, the app is running but unreachable — a common deployment bug that appears in this module's scenario. Students learn these concepts without needing to write Dockerfiles — they understand *what* containers do and *why* they matter.

*Checkpoint: You now understand the journey from development to production — why "it works on my machine" isn't enough, what localhost means and why it breaks, how environments differ, and how containers package everything into a portable unit. This is a natural pause point. Sections 5.16–5.20 cover the automated pipeline that ships code to production and the monitoring that keeps it running.*

#### 5.16 CI/CD: The Automated Assembly Line
**Continuous Integration (CI)** means every code change is automatically built and tested. **Continuous Deployment (CD)** means changes that pass all tests are automatically deployed to production. Together, **CI/CD** creates an automated pipeline: code is pushed → tests run → if tests pass, the app is built → the build is deployed. This eliminates manual, error-prone deployment steps. When the pipeline breaks, it stops the deployment and alerts the team. Students learn to interpret CI/CD pipeline status and error messages. This is where testing and deployment directly intersect — the tests from Part A of this module are what the CI/CD pipeline runs to decide whether a deployment should proceed.

#### 5.17 DNS, Domains, and Routing
When a user types `fitcheck.app` into their browser, a system called **DNS** (Domain Name System) translates that human-readable name into a numeric server address. **Domain configuration** connects your chosen name to the server running your application. **Load balancers** distribute traffic across multiple servers if the app needs to handle many users. Misconfigurations at this layer mean the app is unreachable, even if it's running perfectly on the server.

#### 5.18 Environment Variables in Production
In Section 3.14, we learned that environment variables control backend configuration. In production, they take on heightened importance: the database password, API keys, authentication secrets, and feature flags all live as environment variables. These must be set correctly in the deployment environment — they don't travel with the code. A missing or incorrect environment variable is one of the most common deployment failures, and also one of the most straightforward to diagnose and fix.

#### 5.19 Monitoring, Health Checks, and Rollbacks
Once deployed, the app needs to be monitored. **Health checks** are automated pings that verify the app is responding. **Monitoring dashboards** track performance metrics: response times, error rates, memory usage. **Alerts** notify the team when something goes wrong. And when a deployment causes problems, a **rollback** reverts to the previous working version. Deploying without monitoring is like launching a satellite and throwing away the radio — you won't know it's broken until users start complaining.

#### 5.20 Caching: When the Old Version Won't Go Away
Picture this: you deployed a fix to the workout generator. You test it on your local machine — works perfectly. You deploy to production. You refresh the page — still broken. Your teammate refreshes on their machine — works for them. What's going on? **Caching** is a performance optimization where the system stores a copy of data or files so it doesn't have to fetch or compute them again. Caching happens at multiple levels. The **browser cache** stores CSS, JavaScript, and image files locally so pages load faster on repeat visits. **Server-side caches** store the results of expensive computations or database queries so they don't have to be recalculated for every request. **CDN caches** (Content Delivery Networks) store copies of your application's files on servers around the world so users get faster responses from a nearby location. Caching is essential for performance — without it, every page load would re-download every file and re-query every piece of data. But caching also causes some of the most confusing bugs in software: "I deployed the fix but users still see the old version" is almost always a caching problem. The browser is serving a saved copy of the old JavaScript instead of fetching the updated version. Or the CDN hasn't refreshed its copy yet. Or the server is returning a cached response that was computed before the fix. Students learn to recognize caching as a suspect when a fix has been deployed but the old behavior persists, and to ask the AI assistant about cache invalidation strategies — how to force the system to discard its saved copies and fetch fresh data.

### The Bug: "We Fixed Something, Broke Something Else, and Now the App Is Down"

*This is the most complex scenario in the course — and it mirrors real-world situations that even experienced teams encounter. Take it one problem at a time, using the Observe → Describe → Interpret → Verify loop for each issue. Every failure here — configuration errors, container mismatches, missing environment variables — produces a specific error message or log entry that tells you exactly what's wrong. You don't have to guess.*

Students receive a version of FitCheck where a previous "fix" introduced a regression, and then a deployment goes wrong:

- A well-intentioned fix to the workout validation removed the future-date check — users can now log workouts for dates that haven't happened yet, which makes no sense for a workout *logger*. There were no tests to catch this regression
- The workout type validation was accidentally changed to accept `'weight_loss'` instead of `'cardio'` as a valid type, but the frontend sends `'cardio'` — so every Cardio workout submission fails with a 400 error. Students must recognize the mismatch between what the frontend sends and what the backend accepts, and describe it to the AI assistant
- Students are asked to work with the AI assistant to write tests that would have caught these regressions, then fix the bugs and verify the fixes pass
- When they try to deploy the fixes, the app starts but immediately crashes because the `DATABASE_URL` environment variable points to `localhost` (the developer's machine) instead of the production database server
- The CI/CD pipeline runs but skips the test step due to a misconfigured pipeline file, allowing a broken build to reach production
- The app is running inside the container but users can't reach it — the deployment's load balancer is configured to route traffic to port 8080, but the container is only listening on port 3000 internally with no port mapping to bridge them. The load balancer can't connect and returns a "502 Bad Gateway" error to users after timing out

Students work with the AI assistant to write tests, fix regressions, interpret deployment logs, identify configuration mismatches, and fix the deployment — experiencing the full cycle of testing, shipping, and debugging in production. With multiple interacting problems, the assistant may suggest a fix that addresses one issue but inadvertently masks another. Use the Verify step rigorously: after each fix, confirm the specific problem is resolved *and* check that nothing else changed unexpectedly.

### Learning Outcomes

- Explain what a regression is and why automated testing prevents them
- Explain the testing pyramid and the purpose of each testing level
- Describe tests in terms of behavior ("when X happens, Y should result") rather than implementation details
- Use the arrange/act/assert pattern to describe tests to an AI assistant
- Apply the TDD mindset: describe expected behavior before asking the AI assistant to implement or fix, recognizing this as the same Observe → Describe → Interpret → Verify loop applied to testing
- Distinguish between unit tests (isolated logic), integration tests (components working together), and end-to-end tests (full user journeys) and when each is appropriate
- Identify edge cases and boundary conditions as high-risk areas
- Use code coverage as a diagnostic indicator while understanding its limitations
- Interpret test runner output to understand what passed, what failed, and why
- Describe expected behaviors in arrange/act/assert terms and ask an AI assistant to create and run tests that verify those behaviors and guard against regressions
- Explain what localhost means and why references to it break when moving from development to production
- Explain the purpose of multiple environments and why they need separate configurations
- Understand containers conceptually as portable, reproducible application packages
- Interpret CI/CD pipeline output and identify where a deployment failed
- Explain how DNS translates domain names to server addresses and what happens when it's misconfigured
- Describe the role of monitoring, health checks, and rollbacks in keeping a deployed application healthy
- Recognize caching as a cause when deployed fixes don't appear to take effect
- Describe deployment failures to an AI assistant by distinguishing between code bugs and configuration/infrastructure issues

### Final Vocabulary Check: All Modules

**From Module 5 — Testing:** regression, automated test, behavior (vs. implementation), arrange/act/assert, testing pyramid, unit test, integration test, end-to-end (E2E) test, edge case, boundary condition, test-driven development (TDD), test runner, test suite, code coverage.

**From Module 5 — Deployment:** localhost, environment (development, staging, production), container (Docker), port mapping, CI/CD (continuous integration, continuous deployment), pipeline, DNS, environment variable (in production), health check, monitoring, rollback, caching, CDN, cache invalidation.

As a final self-check, pick any three terms from across all five modules and try explaining them in your own words. If you can describe what they mean and why they matter, you've built a solid working vocabulary for modern software development. Every term from Modules 1–5 is now part of your toolkit.

---

## Course Summary and Progression

| Module | Theory Focus | Bug Category | Key AI Assistant Skill |
|--------|-------------|--------------|----------------------|
| 1. Environment | Terminal, dependencies, project structure, docs, Git, networking, debugging methodology, AI limitations | Missing changes, untracked files, first commit | Establishing the Observe → Describe → Interpret → Verify loop; knowing when to push back |
| 2. Frontend | HTML/CSS/JS layers, components, state, async, accessibility, DevTools | Broken layout, stuck loading state, non-functional button | Describing what you *see* vs. what you *expect* |
| 3. Backend & APIs | Request-response, methods, status codes, JSON, MVC, separation of concerns, routes, middleware, error handling, stack traces | Wrong weather units, middleware ordering, missing error fallback | Tracing request flow through the middleware pipeline, using the Network tab and stack traces to pinpoint failures |
| 4. Databases & Security | SQL vs. NoSQL, schemas, CRUD, migrations, auth, hashing, OWASP, secrets management, endpoint security | Missing migration, schema mismatch, unauthorized access, exposed secrets | Describing data flow, persistence expectations, and articulating threat models |
| 5. Testing & Deployment | Testing pyramid, arrange/act/assert, unit tests, integration tests, TDD, environments, containers, CI/CD, DNS, caching, monitoring | Regressions (validation removed, type mismatch) and deployment failures | Specifying expected behavior precisely and reading logs to describe environment differences |

### The Thread Across All Modules

Each module reinforces the same meta-skill: **the ability to observe software behavior, describe it precisely in natural language, and collaborate with an AI coding assistant to investigate and resolve issues.** The vocabulary and concepts grow more sophisticated with each module, but the fundamental loop remains the same: Observe → Describe → Interpret → Verify.

By the end of the course, students won't be programmers — but they will understand how software systems work, how they fail, and how to leverage AI tools to work effectively with technical systems and teams.

---

## Conclusion: What You've Gained and Where to Go Next

### The Skills You're Taking With You

Over the course of five modules (Module 1 through Module 5), you've built a layered understanding of how modern software works — not by learning to code, but by learning to think about software systems and communicate about them effectively. You can now look at a web application and understand its architecture: a frontend presenting information to users, a backend orchestrating logic and data, APIs connecting systems, databases persisting state, authentication protecting access, tests guarding against regressions, and deployment pipelines moving it all from a developer's laptop to the real world.

More importantly, you've developed a transferable meta-skill: the ability to observe a system's behavior, describe problems with precision, collaborate with an AI assistant to investigate and resolve issues, and verify that the fix actually works. This Observe → Describe → Interpret → Verify loop doesn't just apply to FitCheck or to the specific bugs you've fixed in this course. It applies to any software system, any AI tool, and any technical problem.

### How These Skills Apply Beyond This Course

The concepts and vocabulary you've learned open doors in several directions.

**Working with development teams.** You can now participate in technical conversations with confidence. When a developer says "the API is returning a 500 on the workout endpoint," you understand what that means. When a deployment fails because of a missing environment variable, you can help diagnose it. You can read pull request descriptions, understand what tests are checking, and ask informed questions in code reviews — not about syntax, but about behavior, security, and design.

**Building and maintaining your own projects.** With an AI coding assistant as your partner, you can create, modify, and maintain software applications. You understand the full stack — what each layer does, how they connect, and what can go wrong. You can describe features you want to build, debug issues when they arise, and deploy your work for others to use. The assistant handles the code; you handle the intent, the requirements, and the quality assurance.

**Evaluating software and technical decisions.** Whether you're choosing a vendor, reviewing a technical proposal, or assessing whether a project is on track, you now have the conceptual framework to ask the right questions. Does this system handle authentication properly? Are there tests? How is it deployed? What happens if the external API goes down? These are the questions that distinguish informed decision-makers from those relying on trust alone.

### Continuing Your Learning

This course has given you a foundation. If you want to go deeper, here are natural next steps.

**Practice with new projects.** The best way to solidify these skills is to use them. Pick a different application — a personal project, an open-source tool, a prototype for a business idea — and work with an AI assistant to understand, modify, or build it. Every new project will reinforce the patterns you've learned and introduce new challenges.

**Explore specializations.** Each module in this course could be an entire course on its own. If you found databases fascinating, explore data modeling and query optimization. If security captured your attention, look into application security and penetration testing. If deployment excited you, explore cloud platforms and infrastructure as code. Your AI assistant can guide you through any of these topics.

**Stay current.** AI coding assistants are evolving rapidly. New tools, new capabilities, and new workflows emerge regularly. The foundational concepts you've learned — how software systems work, how to describe problems, how to verify solutions — will remain stable. But the tools will get better, and keeping up with their capabilities will make you more effective over time.

### A Final Thought

The title of this course is "Building Software with AI Coding Assistants," but what you've really learned is how to think about complex systems and communicate about them clearly. That skill predates AI and will outlast any particular tool. The AI assistant amplifies your effectiveness, but the understanding — of how data flows, how security works, how systems connect and break and get fixed — that understanding is yours. No tool gave it to you, and no tool can take it away.

You came into this course without writing a line of code, and you're leaving it able to build, debug, and maintain real software — with an AI assistant as your partner. That's a significant shift in what you can do. The assistant handles the code; you handle the intent, the quality assurance, and the critical thinking. The most effective practitioners aren't the ones who accept every suggestion — they're the ones who ask "does this actually make sense?" before clicking apply. Your judgment, informed by everything you've learned in this course, is what turns a powerful tool into a reliable one.
