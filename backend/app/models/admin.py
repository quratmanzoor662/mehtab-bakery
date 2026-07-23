# Admin users are stored in the `admins` MongoDB collection.
# Documents include: email, name, role, password_hash, timestamps.
# Seeded on startup from ADMIN_EMAIL / ADMIN_PASSWORD when empty.
# Legacy plaintext `password` fields are migrated to bcrypt `password_hash`.
