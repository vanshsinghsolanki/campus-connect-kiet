# Campus Connect — Project Synopsis

**A Social-Academic Networking Platform**

| Academic detail | Information |
|---|---|
| Project type | Individual academic project |
| Submitted by | **Vansh Singh Solanki** |
| Roll number | **2628MCA0112** |
| Programme | Master of Computer Applications (MCA) |
| Institution | KIET Deemed to be University |
| Course | Front End Web Development |
| Course code | 26CA205PCB |
| Academic session | 2026 |
| Current phase | Phase 1 — Frontend prototype |

---

## 1. Abstract

Effective peer-to-peer and alumni interaction plays an important role in the academic and career development of students. However, students often rely on informal channels such as messaging groups, notice boards and word-of-mouth referrals to connect with seniors, mentors and career opportunities. These methods are unstructured, difficult to search, and useful information can become buried in long conversations.

Campus Connect is a student-focused social-academic networking web application concept that addresses this gap through an organised platform. It enables students to discover senior students and alumni, search and filter profiles by academic year, department, skills and verification status, and explore opportunities such as internships, jobs, hackathons and certifications alongside curated learning resources and campus events.

The current Semester 1 implementation is a front-end prototype developed using HTML5, CSS3 and Vanilla JavaScript. Figma is used for interface design and Git/GitHub for version control, with GitHub Pages used for deployment. Profiles, opportunities, resources and events are sample data. Registration, login and verification are UI-level workflows that demonstrate the intended user experience rather than fully operational backend processes.

The application separates data from presentation logic to support a future full-stack phase. Planned technologies include Node.js, Express.js, a database such as MongoDB or Firebase Firestore, Firebase Authentication and Firebase Storage. The future phase may introduce real user accounts, persistent connection requests, messaging, notifications and an administrative verification dashboard.

By applying front-end web development concepts to a practical campus-oriented problem, Campus Connect demonstrates a responsive prototype and a structured path toward a complete social-academic networking platform.

## 2. Motivation

The project is motivated by the difficulty students can face when identifying suitable seniors and alumni to approach for subject guidance, placement preparation and career advice. Helpful information may be scattered across messaging groups, personal contacts and informal word-of-mouth, and can remain inaccessible to students who are not already connected to the right people.

This highlights the need for a structured way to discover people and opportunities based on shared skills, interests, department and academic year, rather than depending on chance introductions. A dedicated platform can make academic and career-related information easier to find.

Developing Campus Connect also provides an opportunity to apply HTML, CSS and JavaScript concepts from the Front End Web Development course to a practical problem, while keeping the codebase organised for possible full-stack implementation in a later phase.

## 3. Introduction

### Domain

Campus Connect belongs to the Social-Academic Networking domain. It combines elements of a student community platform with an academic and career-opportunity resource hub.

### Target users

The application is designed for three broad user groups within an academic institution:

- **Current students / juniors:** seeking guidance and opportunities.
- **Senior students:** able to mentor juniors and share academic experience.
- **Alumni:** able to share experience, opportunities and industry exposure.

### Problem addressed

Students may not have a single searchable place to find peers, seniors or alumni based on skills and interests, or to discover opportunities, learning resources and events in one location. Campus Connect addresses this by centralising discovery and information in a common, structured interface.

### What Campus Connect does

The application provides a searchable directory of profiles, filters by academic year, department, skills and verification status, detailed profile pages, an opportunities board for internships, jobs, hackathons and certifications, a learning resource library, campus events, and front-end registration and verification workflows.

### Current scope

The current Semester 1 submission is a front-end-only implementation built with HTML5, CSS3 and Vanilla JavaScript. It has no backend, live database, real student records, real authentication, or live connection and messaging system. All displayed data is sample or demonstration data.

### Future direction

A later full-stack phase is planned to introduce a Node.js/Express.js backend, a database such as MongoDB or Firebase Firestore, Firebase Authentication and Firebase Storage.

## 3.1 Objectives

1. To design and build a searchable and filterable directory of student and alumni profiles.
2. To provide a front-end profile-creation and registration workflow for users.
3. To implement multi-parameter profile filtering by academic year, department, skills and verification status.
4. To create an opportunities board presenting internships, jobs, hackathons and certifications.
5. To build a resource library section for curated learning materials.
6. To design a verification-system interface demonstrating how profile authenticity could be confirmed in a live system.
7. To ensure a responsive interface across desktop, tablet and mobile devices.
8. To structure the codebase by separating data, presentation and logic so it is prepared for possible backend integration.

## 3.2 Future Scope (Phase 2)

The following items are proposed future work and are not implemented in the current submission:

- Real user accounts and persistent user data.
- Firebase Authentication for real login and sign-up.
- A live database using MongoDB or Firebase Firestore to replace sample data files.
- Backend APIs built with Node.js and Express.js.
- Persistent student and alumni profiles.
- A functional connection-request system between users.
- Messaging/chat between connected users.
- An admin dashboard for profile verification and content moderation.
- The ability for verified users or organisations to post opportunities.
- The ability for users to upload learning resources.
- Notifications for connection requests, messages and new opportunities.
- API-driven search and filtering instead of current client-side sample-data filtering.
- A possible migration of the frontend to React, to be evaluated rather than assumed.

## 3.3 Findings

- A structured discovery interface can make student networking more purposeful than relying only on informal, chat-based communication.
- Filtering profiles by skill, academic year and department can improve how quickly a relevant profile is located, even with a small sample dataset.
- A front-end prototype can demonstrate the intended user experience without requiring or exposing real private student data at this stage.
- Keeping sample data separate from application logic and presentation creates a clear path for future backend integration.
- Responsive design is important because students may access the platform from desktops, laptops and mobile devices.

## 4. Analysis Phase

### 4.1 Requirement Analysis

#### 4.1.1 Functional Requirements

- The system shall provide responsive navigation to Home, People, Opportunities, Resources, Events and Sign Up/Login sections.
- The system shall allow users to browse a directory of sample student and alumni profiles.
- The system shall allow profile search by name or keyword.
- The system shall allow filtering by academic year, department, skills and verification status.
- The system shall display a detailed profile page for a selected profile.
- The system shall display sample internships, jobs, hackathons and certifications, filterable by category.
- The system shall display a resource library filterable by resource type.
- The system shall display events filterable by event type, with a demonstration registration action.
- The system shall provide a front-end registration interface for creating a demo profile.
- The system shall provide a front-end verification interface illustrating a document- or method-based workflow with a demo status.
- The system shall provide a front-end login interface for demonstration only, without real authentication.
- The system shall display toast notifications for UI-level feedback.

**Note:** These features currently operate on sample/demo data using client-side JavaScript. No data is transmitted to or stored on a server.

#### 4.1.2 Non-Functional Requirements

- **Usability:** the interface should be simple and intuitive for students unfamiliar with the platform.
- **Responsiveness:** the layout should adapt to desktop, tablet and mobile screen sizes.
- **Accessibility:** pages should follow basic accessibility practices such as semantic HTML and readable colour contrast.
- **Performance:** pages should load quickly because the current data is static and client-side.
- **Maintainability:** code should be modular, with separate HTML, CSS, JavaScript and data files.
- **Browser compatibility:** the application should work on current versions of major browsers such as Chrome, Firefox and Edge.
- **Code quality:** code should follow consistent naming, indentation and commenting conventions.
- **Security and privacy:** no real personal data is collected in the current phase; security becomes critical when real authentication and a database are introduced in Phase 2.

### 4.2 DFD / Use Case Description

The current Phase 1 prototype is a client-side application. The following context-level description identifies the actors and interactions represented by the project scope.

**Actors**

- **Student / Junior:** browses, searches, filters and views sample profiles, and tries demonstration registration flows.
- **Senior Student:** is represented through a sample profile and may be discovered by other users.
- **Alumni:** is represented through a sample profile and may be discovered by other users.
- **Admin:** planned for Phase 2 only; it is not present in the current implementation.

**Level-0 data-flow description**

- Student / Junior → Campus Connect: search, filter, view and demo registration.
- Senior Student / Alumni → Campus Connect: profile display and demonstration opportunity/resource information.
- Campus Connect → User: renders sample profiles, opportunities, resources and events.
- Verification and administration are future Phase 2 concepts; no live database or admin workflow is represented in the current implementation.

**Use case summary**

| Use case | Description | Phase |
|---|---|---|
| Browse Profiles | View the list of sample student/alumni profiles. | Phase 1 |
| Search / Filter Profiles | Search by keyword and filter by year, department, skill and verification status. | Phase 1 |
| View Profile Detail | Open a detailed view of a selected profile. | Phase 1 |
| Register (Demo) | Fill and submit the front-end registration form. | Phase 1 |
| Verify Profile (Demo) | Go through the UI verification workflow and view a demo status. | Phase 1 |
| Login (Demo) | Access the front-end login form; no real authentication. | Phase 1 |
| Browse Opportunities | View and filter sample internships, jobs, hackathons and certifications. | Phase 1 |
| Browse Resources | View and filter sample learning resources. | Phase 1 |
| Browse Events | View and filter sample events; demo registration action. | Phase 1 |
| Send Connection Request | Send a real, persisted connection request to another user. | Phase 2 |
| Admin Verification | Administrator reviews and approves/rejects a real profile. | Phase 2 |
| Messaging | Exchange real-time messages with a connected user. | Phase 2 |

### 4.3 System Flow

**People discovery flow**

Home → Explore / Sign Up → Registration → Profile Information → Explore People → Search / Filter → View Profile → Connect Request (Demo)

**Opportunities flow**

Opportunities → Category Filter → View Opportunity → Apply (Demo)

**Resources flow**

Resources → Type Filter → View Resource → Download / Open

**Events flow**

Events → Type Filter → View Event → Register (Demo)

**Verification flow**

Sign Up → Choose Verification Method → Upload / Enter Information → Submit → Demo Status Result

## 5. Technology Stack (Web Development)

| Category | Current implementation (Phase 1) | Future scope (Phase 2) |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript | Possible migration to React (not finalised) |
| Design | Figma (wireframes and UI design) | — |
| Fonts | Google Fonts | — |
| Backend | Not implemented | Node.js, Express.js |
| Database | Not implemented; sample data via `data.js` | MongoDB or Firebase Firestore |
| Authentication | Not implemented; UI demo only | Firebase Authentication |
| File storage | Not implemented | Firebase Storage |
| Version control | Git, GitHub | Git, GitHub |
| Editor | Visual Studio Code | Visual Studio Code |
| Deployment | GitHub Pages | Vercel / Render / Railway (backend hosting options) |

## 6. System Design & Methodology

The project follows a step-wise front-end development methodology:

1. **Requirement Analysis:** identify target users (students, seniors and alumni) and the core features needed for the Semester 1 front-end prototype.
2. **UI/UX Design:** prepare wireframes and layout plans for Home, People, Opportunities, Resources, Events, Registration and Verification using Figma.
3. **Data Architecture:** design sample data structures for profiles, opportunities, resources and events, keeping them independent of display logic.
4. **HTML Structure:** build semantic HTML pages and sections for the application.
5. **CSS Styling:** style the pages using CSS3, including CSS Grid and Flexbox, in the shared stylesheet.
6. **JavaScript Development:** implement search, filtering, card/list rendering, form handling and toast notifications.
7. **Responsive Testing:** review and refine layouts at multiple breakpoints for mobile, tablet and desktop.
8. **Cross-Browser Testing:** check behaviour across major browsers such as Chrome, Firefox and Edge.
9. **Deployment:** publish the frontend on GitHub Pages for review and demonstration.
10. **Future Backend Integration:** map the current sample data structure to future database collections or tables.

## 7. Expected Outcomes

### Current Phase 1 outcomes

- A responsive frontend prototype for desktop, tablet and mobile devices.
- A searchable and filterable student/alumni directory built on sample data.
- Profile detail pages for listed sample profiles.
- An opportunities board listing sample internships, jobs, hackathons and certifications.
- A resource library for browsing sample learning materials.
- An events section with filtering and a demonstration registration action.
- Front-end registration, verification and login interfaces demonstrating intended workflows.
- A publicly accessible GitHub Pages deployment for review and demonstration.

### Future Phase 2 outcomes

- A full-stack platform with real user accounts, authentication and persistent data.
- Real connection requests, messaging and notifications between users.
- An admin dashboard for profile verification and content moderation.
- API-driven search, filtering and data management backed by a live database.

## 8. References

1. MDN Web Docs — HTML: https://developer.mozilla.org/en-US/docs/Web/HTML
2. MDN Web Docs — CSS: https://developer.mozilla.org/en-US/docs/Web/CSS
3. MDN Web Docs — JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
4. W3C / Web Content Accessibility Guidelines (WCAG): https://www.w3.org/WAI/standards-guidelines/wcag/
5. Google Fonts: https://fonts.google.com/
6. Figma Documentation: https://help.figma.com/
7. Git Documentation: https://git-scm.com/doc
8. GitHub Pages Documentation: https://docs.github.com/en/pages
9. Firebase Documentation (planned Phase 2 work): https://firebase.google.com/docs

---

**Prepared by:** Vansh Singh Solanki  
**Roll Number:** 2628MCA0112  
**Programme:** MCA · KIET Deemed to be University  
**Course:** Front End Web Development (26CA205PCB)  
**Academic Session:** 2026
