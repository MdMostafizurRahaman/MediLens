#!/usr/bin/env python3
"""
Convert doctors_data.json to SQL INSERT statements
Generates SQL for importing 1000+ Bangladesh doctors to PostgreSQL/MySQL
"""

import json
import re

def escape_sql_string(value):
    """Escape single quotes in SQL strings"""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    
    value = str(value)
    # Escape single quotes
    value = value.replace("'", "''")
    return f"'{value}'"

def json_array_to_sql(items):
    """Convert Python list to PostgreSQL ARRAY format"""
    if not items:
        return "'{}'"
    
    # Escape each item
    escaped = [item.replace("'", "''") for item in items]
    quoted = [f"'{item}'" for item in escaped]
    return f"ARRAY[{','.join(quoted)}]"

def generate_sql_inserts():
    """Generate SQL INSERT statements from JSON data"""
    
    with open("doctors_data.json", "r") as f:
        data = json.load(f)
    
    users = data.get("users", [])
    doctors = data.get("doctors", [])
    
    sql_lines = []
    sql_lines.append("-- Generated SQL for 1000+ Bangladesh Doctors")
    sql_lines.append("-- Auto-generated from doctors_data.json")
    sql_lines.append(f"-- Total records: {len(users)} users + {len(doctors)} doctors")
    sql_lines.append("--")
    sql_lines.append("")
    
    # Drop and recreate if needed
    sql_lines.append("-- Step 1: Insert Users (Doctors)")
    sql_lines.append("INSERT INTO users (email, password, first_name, last_name, phone_number, gender, role, date_of_birth, address) VALUES")
    
    user_values = []
    for user in users:
        values = (
            f"({escape_sql_string(user['email'])}, "
            f"{escape_sql_string(user['password'])}, "
            f"{escape_sql_string(user['firstName'])}, "
            f"{escape_sql_string(user['lastName'])}, "
            f"{escape_sql_string(user['phoneNumber'])}, "
            f"{escape_sql_string(user['gender'])}, "
            f"{escape_sql_string(user['role'])}, "
            f"{escape_sql_string(user['dateOfBirth'])}, "
            f"{escape_sql_string(user['address'])})"
        )
        user_values.append(values)
    
    sql_lines.append(",\n".join(user_values) + ";")
    sql_lines.append("")
    
    # Insert Doctors
    sql_lines.append("-- Step 2: Insert Doctor Records")
    sql_lines.append("INSERT INTO doctor (specialization, degree, phone_number, chamber_address, designation, institute, current_city, available_time, website_url, status, user_email) VALUES")
    
    doctor_values = []
    for doc in doctors:
        # Handle arrays - PostgreSQL ARRAY format
        specs = json_array_to_sql(doc.get('specialization', []))
        degrees = json_array_to_sql(doc.get('degree', []))
        phones = json_array_to_sql(doc.get('phoneNumber', []))
        
        values = (
            f"({specs}, "
            f"{degrees}, "
            f"{phones}, "
            f"{escape_sql_string(doc.get('chamberAddress'))}, "
            f"{escape_sql_string(doc.get('designation'))}, "
            f"{escape_sql_string(doc.get('institute'))}, "
            f"{escape_sql_string(doc.get('currentCity'))}, "
            f"{escape_sql_string(doc.get('availableTime'))}, "
            f"{escape_sql_string(doc.get('websiteUrl'))}, "
            f"{escape_sql_string(doc.get('status'))}, "
            f"{escape_sql_string(doc.get('email'))})"
        )
        doctor_values.append(values)
    
    sql_lines.append(",\n".join(doctor_values) + ";")
    sql_lines.append("")
    
    # Statistics
    sql_lines.append("-- Statistics")
    sql_lines.append(f"-- Total Users: {len(users)}")
    sql_lines.append(f"-- Total Doctors: {len(doctors)}")
    sql_lines.append("-- Status Distribution:")
    
    status_count = {}
    for doc in doctors:
        status = doc.get('status', 'UNKNOWN')
        status_count[status] = status_count.get(status, 0) + 1
    
    for status, count in sorted(status_count.items()):
        sql_lines.append(f"--   {status}: {count}")
    
    sql_lines.append("")
    sql_lines.append("-- Verify import:")
    sql_lines.append("-- SELECT COUNT(*) FROM users WHERE role = 'ROLE_DOCTOR';")
    sql_lines.append("-- SELECT COUNT(*) FROM doctor;")
    sql_lines.append("-- SELECT status, COUNT(*) FROM doctor GROUP BY status;")
    
    return "\n".join(sql_lines)

if __name__ == "__main__":
    print("Generating SQL INSERT statements...")
    sql_content = generate_sql_inserts()
    
    # Save SQL file
    with open("V3__Import_1050_Bangladesh_Doctors.sql", "w") as f:
        f.write(sql_content)
    
    print(f"✅ SQL file generated: V3__Import_1050_Bangladesh_Doctors.sql")
    print(f"📊 Lines of SQL: {len(sql_content.split(chr(10)))}")
    print("\n📋 Next Steps:")
    print("1. Copy V3__Import_1050_Bangladesh_Doctors.sql to: src/main/resources/db/migration/")
    print("2. Application startup will run the migration automatically (Flyway)")
    print("3. OR manually run: psql -U user -d database -f V3__Import_1050_Bangladesh_Doctors.sql")
    print("\n✨ Your database will have 1050+ real Bangladesh doctors with proper categories!")
