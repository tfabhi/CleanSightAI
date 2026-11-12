# Implemented vs simulated / planned

This document is deliberately explicit so the prototype is described accurately in a GitHub repository or interview.

## Implemented in this reconstructed prototype

- React citizen reporting form.
- Image upload to the local Express backend, with MIME-type and file-size checks.
- Express API to create, list, filter, and update complaints.
- Local JSON persistence for complaint records.
- Local uploaded-image serving.
- Authority dashboard controls for status, priority, and worker assignment.
- Worker view filtered by assigned worker.
- Summary counts for total, pending, in-progress, and resolved reports.
- Perceptual-hash image comparison against user-supplied labelled reference images.

## Basic / limited implementation

- **Image classification:** a difference-hash nearest-neighbour comparison, not a trained AI model. It may fail when the same type of waste is photographed from a different angle, distance, or lighting condition. Confidence is a similarity score, not a calibrated probability.
- **Category selection:** users can choose a category manually; otherwise the reference-image matcher supplies a label or `Unknown`.
- **Roles:** role switching is a demo selector, not secure login or role-based authorization.
- **Location:** location is entered as text. No GPS capture, geocoding, or live map is connected.
- **Analytics:** counts are computed from local complaint records. There are no trend charts, heatmaps, or live municipal data feeds.

## Simulated / not implemented

- Real municipal authority integration or complaint dispatch.
- Authentication, authorization, and user accounts.
- Real-time push notifications or priority alerts.
- Live Google Maps integration, geotagging, and route planning.
- A trained TensorFlow / PyTorch garbage-detection model.
- Cloud database, production hosting, or multi-user synchronization.
- Dedicated deployed admin portal and worker mobile app.

## Recommended next steps

1. Replace the hash matcher with a trained image classifier and evaluate it on a labelled test set.
2. Add authentication and server-side role permissions.
3. Move uploads and records to managed cloud storage/database.
4. Add GPS/map integration and notification delivery.
5. Add tests, logging, rate limiting, and deployment configuration.
