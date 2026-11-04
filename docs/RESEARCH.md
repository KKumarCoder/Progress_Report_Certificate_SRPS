# Design and implementation references

Reviewed official sources:
- Express production security: https://expressjs.com/advanced/best-practice-security/ — input validation, secure cookies, Helmet, TLS for deployment.
- MongoDB unique indexes: https://www.mongodb.com/docs/manual/core/index-unique/ — unique admission numbers and unique student/session reports.
- MongoDB transactions: https://www.mongodb.com/docs/manual/core/transactions/ — this implementation uses single-report documents and atomic conditional revisions for report edits; multirow student import is explicitly sequential, not transactional.

The supplied report artwork, not a third-party template, is the visual/content reference. The grading ranges are taken from that artwork; school management must approve rounding and promotion policy. These references do not establish that the ERP is CBSE-certified.
