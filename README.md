# CardioSuite

CardioSuite is a professional cardiology-clinic operations workspace for patient
rooming, vital-sign capture, medication reconciliation, staff-to-physician
handoffs, scheduling, triage, and role-aware staff access.

## Included

- Individual staff sign-in and account creation
- Persistent browser sessions
- Role-aware navigation for medical assistants/nurses, cardiologists,
  receptionists, and clinic administrators
- Today's patient-arrival queue
- Editable intake and vital signs
- Live red-flag threshold checks
- Save-draft and physician-handoff flows
- Staff-account management
- Responsive desktop and mobile layouts

## Staff access

Use **Create account** on the sign-in screen to add each staff member. Accounts
are stored only in the current browser for this frontend demonstrator.

## Development

```bash
npm install
npm run dev
```

Validation:

```bash
npm run build
npm run test:sites
```

## Important

This deployment is a frontend demonstrator. Accounts and drafts are stored in
the current browser. Do not enter real patient information or protected health
information until the app is connected to a production identity provider,
compliant clinical data backend, audit logging, encryption, and the clinic's
required privacy/security controls.
