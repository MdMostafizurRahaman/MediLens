#!/usr/bin/env python3
"""
Generate 1000+ Bangladeshi Doctor Records for MediLens Database
This script creates realistic doctor data with proper names, specializations, degrees, etc.
"""

import random
import json
from datetime import datetime, timedelta

# Bangladeshi First Names
FIRST_NAMES_MALE = [
    "Mohammad", "Ahmed", "Ali", "Hassan", "Hasan", "Rahman", "Abdullah", "Karim", "Samir", "Rashid",
    "Jamal", "Khalid", "Sohail", "Tahsin", "Rajib", "Sumon", "Arif", "Anil", "Arjun", "Biplob",
    "Deepak", "Mahesh", "Arun", "Milon", "Jahedul", "Nizam", "Sohel", "Kamal", "Rahim", "Faisal",
    "Abdul", "Faruq", "Mohan", "Karthik", "Vikram", "Nasiruddin", "Akbar", "Bashir", "Chowdhury", "Dalal",
    "Enayet", "Farooq", "Gafoor", "Habib", "Iqbal", "Jalil", "Karim", "Latif", "Majid", "Nasir",
    "Omit", "Pasha", "Quddus", "Rafiq", "Saif", "Tajuddin", "Uddin", "Wasim", "Yusuf", "Zaman"
]

FIRST_NAMES_FEMALE = [
    "Fatima", "Nasrin", "Rubina", "Afsana", "Joya", "Nadia", "Zahira", "Shabnam", "Shima", "Ruma",
    "Priya", "Anita", "Shibani", "Padma", "Swati", "Deepti", "Divya", "Anjali", "Pooja", "Sabina",
    "Sharina", "Salma", "Roshni", "Ashma", "Farah", "Mina", "Kavya", "Prema", "Sneha", "Neha",
    "Nusrat", "Sabina", "Shima", "Tania", "Ushma", "Vasundara", "Wazira", "Yuki", "Zahara", "Zeena",
    "Aishya", "Bashira", "Champa", "Dina", "Easha", "Farida", "Gita", "Hera", "Indira", "Jaya"
]

LAST_NAMES = [
    "Ahmed", "Ali", "Khan", "Hassan", "Haque", "Islam", "Roy", "Chowdhury", "Miah", "Hasan",
    "Akhter", "Begum", "Akter", "Aziz", "Bhat", "Bose", "Chatterjee", "Das", "Dasgupta", "Dasgupta",
    "Dutta", "Ghosh", "Gupta", "Hanif", "Haque", "Hasan", "Hossain", "Husain", "Iqbal", "Jahan",
    "Karim", "Kasem", "Khan", "Kumar", "Kundu", "Latif", "Majumdar", "Malik", "Mandal", "Manna",
    "Matin", "Mazumdar", "Miah", "Misra", "Mittra", "Mohajan", "Mohan", "Moitra", "Molla", "Mukherjee",
    "Mukherjee", "Mullah", "Mukerji", "Mukherjee", "Mullick", "Muni", "Munir", "Nair", "Nandi", "Narayan",
    "Nath", "Nayak", "Nayeem", "Neogi", "Nath", "Nayak", "Oddar", "Okande", "Olayinde", "Omara",
    "Omid", "Omidi", "Oommen", "Oolayan", "Oolkar", "Oommen", "Oota", "Oram", "Organ", "Oropallo",
    "Paal", "Paallan", "Pabalan", "Pach", "Padhy", "Padley", "Padilla", "Padsam", "Padzala", "Padsmore",
    "Pahari", "Paharia", "Pahan", "Pahari", "Pahera", "Pahlavi", "Pahl", "Pahle", "Pahli", "Pahra"
]

# Specializations
SPECIALIZATIONS = [
    "Cardiology", "Neurology", "Orthopedic Surgery", "Pediatrics", "General Medicine",
    "Dermatology", "ENT", "Gynecology", "Ophthalmology", "Psychiatry",
    "Pulmonology", "Gastroenterology", "Nephrology", "Urology", "Oncology",
    "Endocrinology", "Rheumatology", "Immunology", "Infectious Disease", "Internal Medicine",
    "Family Medicine", "Emergency Medicine", "Anesthesia", "Pathology", "Radiology",
    "Surgery", "Vascular Surgery", "Plastic Surgery", "Thoracic Surgery", "Neurosurgery",
    "Interventional Cardiology", "Interventional Radiology", "Critical Care", "Traumatology", "Nephrology",
    "Tropical Medicine", "Public Health", "Occupational Health", "Sports Medicine", "Preventive Medicine",
    "Geriatric Medicine", "Community Medicine", "Pediatric Cardiology", "Pediatric Neurology", "Pediatric Surgery",
    "Maternal Fetal Medicine", "Neonatology", "Pediatric Orthopedics", "Pediatric Dermatology", "Pediatric Psychiatry",
    "Stroke Specialist", "Epilepsy Specialist", "Headache Specialist", "Movement Disorders", "Neuro-psychiatry",
    "Joint Replacement", "Spine Surgery", "Sports Medicine", "Trauma Surgery", "Pediatric Orthopedics",
    "Pediatric Infectious Disease", "Pediatric Cardiology", "Pediatric Neurology", "Immunology", "Neonatology",
    "Cosmetic Dermatology", "Pediatric Dermatology", "Venereology", "Laser Therapy", "Cosmetic Surgery",
    "Otology", "Rhinology", "Otolaryngology", "Head and Neck Surgery", "Audiology",
    "Obstetrics", "Reproductive Medicine", "Maternal Fetal Medicine", "Urogynaecology", "High Risk Pregnancy",
    "Cataract Surgery", "Retina Specialist", "Glaucoma Specialist", "Cornea Specialist", "Pediatric Ophthalmology",
    "Child Psychiatry", "Addiction Medicine", "Geriatric Psychiatry", "Psychotherapy", "Forensic Psychiatry"
]

# Sub-specializations
SUB_SPECS = [
    "Internal Medicine", "Family Practice", "Clinical Medicine", "Preventive Medicine",
    "Tropical Medicine", "Public Health", "Occupational Health", "Community Medicine",
    "Critical Care", "Emergency Care", "Intensive Care", "Acute Care",
    "Intervention", "Diagnostic", "Therapeutic", "Surgical",
    "Medical", "Surgical", "Diagnostic", "Therapeutic",
    "Advanced", "Expert", "Senior", "Consultant Level"
]

# Degrees
DEGREES = [
    "MBBS", "MD Cardiology", "MD Neurology", "MS Orthopedics", "MD Pediatrics",
    "MD General Medicine", "MS Gynecology", "MD Psychiatry", "MS Ophthalmology", "MS ENT",
    "MD Dermatology", "MD Pulmonology", "MD Gastroenterology", "MD Nephrology", "MS Urology",
    "MD Oncology", "MD Endocrinology", "MD Rheumatology", "MD Infectious Disease", "MS General Surgery",
    "MS Vascular Surgery", "MS Plastic Surgery", "MS Thoracic Surgery", "MS Neurosurgery", "MS Pediatric Surgery",
    "FCPS", "FRCS", "FACS", "Fellowship Cardiology", "Fellowship Neurology",
    "Diploma General Practice", "MPH", "MSc Medical Science", "PhD", "DM Cardiology"
]

# Bangladeshi Cities
CITIES = [
    "Dhaka", "Chittagong", "Ctg", "Sylhet", "Khulna", "Rajshahi", "Barishal", 
    "Jashore", "Kushtia", "Pabna", "Naogaon", "Bogra", "Dinajpur", "Rangpur",
    "Gaibandha", "Nilphamari", "Lalmonirhat", "Thakurgaon", "Mymensingh", "Jamalpur",
    "Sherpur", "Netrokona", "Tangail", "Manikganj", "Munshiganj", "Narayanganj",
    "Gazipur", "Narsingdi", "Kishoreganj", "Madaripur", "Faridpur", "Shariatpur"
]

# Chamber locations in major cities
CHAMBER_LOCATIONS = {
    "Dhaka": [
        "Dhanmondi", "Gulshan", "Banani", "Motijheel", "Farmgate", "Mirpur", "Panthapath",
        "Uttara", "Bashundhara", "Mohakhali", "Kawran Bazaar", "Jatrabari", "Karwan Bazar",
        "Ramna", "Paltan", "Kakrail", "Kamrangirchar", "Lalbagh", "Arambag", "Malibagh"
    ],
    "Ctg": [
        "GEC", "Halishahar", "Patenga", "Agreabad", "Anderkilla", "Chandgaon", "Kotwali",
        "Bayazid", "CDA", "Nasirabad", "Chawkbazar", "Sadarghat", "Khatunganj", "Badsha Mia"
    ],
    "Sylhet": [
        "Zindabazar", "Topkhana", "Amborkhana", "Rikabibazar", "Moghlipara", "Shahjalal"
    ],
    "Khulna": [
        "KDA", "Gazi Salahuddin", "Khan Jahan Ali Park", "Sonadighi", "Boyra", "Daukaripara"
    ],
    "Rajshahi": [
        "Gouripur", "Chalihapur", "Rajpara", "Boalia", "Motihar", "Banasree"
    ]
}

# Hospital/Institute names
INSTITUTES = [
    "Square Hospital", "Apollo Hospital", "United Hospital", "Evercare Hospital", "Ibn Sina Hospital",
    "National Institute of Neuroscience", "Chittagong Medical College", "Rajshahi Medical College",
    "Dhaka Medical College", "Barishal Medical College", "Khulna Medical College", "Sylhet Medical College",
    "Dhaka Shishu Hospital", "Chittagong Shishu Hospital", "National Heart Foundation",
    "National Eye Center", "Bangabandhu Medical University", "BSMMU", "IPGM&R",
    "Labaid Hospital", "Popular Hospital", "Bangabandhu General Hospital", "Dhaka Medical College Hospital",
    "Chattagram Maa-O-Shishu Hospital", "Ibrahim Medical College", "City Hospital",
    "Bangladesh Medical College", "Northern Medical College", "Green Life Medical College",
    "Holy Family Red Crescent Hospital", "FCPS Medical College", "Marks Medical College"
]

STATUS = ["ACTIVE", "PENDING", "DISABLED"]

def generate_phone():
    """Generate Bangladesh phone number"""
    return f"+8801{random.randint(4,9)}{random.randint(0,9)}{random.randint(100,999)}{random.randint(1000,9999)}"

def generate_dob():
    """Generate realistic date of birth (doctors between 35-70 years old)"""
    days_back = random.randint(12775, 25550)  # ~35-70 years
    return (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')

def generate_email(first, last, spec):
    """Generate unique email"""
    spec_short = spec.lower().replace(" ", "").replace("&", "").replace("-", "")[:5]
    return f"dr.{first.lower()}.{last.lower()}.{spec_short}{random.randint(1,9)}@medilens.com"

def generate_doctors(count=1000):
    """Generate Bangladeshi doctor records"""
    doctors = []
    users = []
    
    for i in range(count):
        is_female = random.choice([True, False])
        first_name = random.choice(FIRST_NAMES_FEMALE if is_female else FIRST_NAMES_MALE)
        last_name = random.choice(LAST_NAMES)
        gender = "F" if is_female else "M"
        
        # Specialization
        primary_spec = random.choice(SPECIALIZATIONS)
        secondary_specs = random.sample([s for s in SPECIALIZATIONS if s != primary_spec], k=random.randint(0, 2))
        specializations = [primary_spec] + secondary_specs
        
        # Degrees
        degrees = ["MBBS"] + random.sample(DEGREES[1:], k=random.randint(1, 3))
        
        # Basic info
        phone1 = generate_phone()
        phone2 = generate_phone() if random.random() > 0.7 else None
        phone_numbers = [phone1]
        if phone2:
            phone_numbers.append(phone2)
        
        city = random.choice(CITIES)
        chamber_city = city if city in CHAMBER_LOCATIONS else random.choice(list(CHAMBER_LOCATIONS.keys()))
        chamber_address = f"{random.choice(CHAMBER_LOCATIONS[chamber_city])}, {chamber_city}"
        
        designation = random.choice([
            "Consultant", "Senior Consultant", "Assistant Consultant", "Assistant Professor",
            "Associate Professor", "Professor", "General Practitioner", "Doctor"
        ])
        
        institute = random.choice(INSTITUTES)
        available_time = random.choice([
            "9:00 AM - 4:00 PM", "10:00 AM - 5:00 PM", "8:30 AM - 3:30 PM",
            "9:00 AM - 5:00 PM", "10:00 AM - 6:00 PM", "2:00 PM - 8:00 PM"
        ])
        
        website_url = f"https://dr-{first_name.lower()}-{last_name.lower()}.com" if random.random() > 0.5 else None
        
        status = random.choice(STATUS)  # ~60% ACTIVE, 30% PENDING, 10% DISABLED
        status = "ACTIVE" if random.random() > 0.4 else ("PENDING" if random.random() > 0.75 else "DISABLED")
        
        email = generate_email(first_name, last_name, primary_spec)
        dob = generate_dob()
        
        # User record
        user = {
            "email": email,
            "password": "$2a$10$abcdefghijklmnopqrstuvwxyz",  # hashed placeholder
            "firstName": first_name,
            "lastName": last_name,
            "phoneNumber": phone1,
            "gender": gender,
            "role": "ROLE_DOCTOR",
            "dateOfBirth": dob,
            "address": city
        }
        users.append(user)
        
        # Doctor record
        doctor = {
            "email": email,
            "specialization": specializations,
            "degree": degrees,
            "phoneNumber": phone_numbers,
            "chamberAddress": chamber_address,
            "designation": designation,
            "institute": institute,
            "currentCity": city,
            "availableTime": available_time,
            "websiteUrl": website_url,
            "status": status
        }
        doctors.append(doctor)
        
        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1} doctors...")
    
    return users, doctors

def generate_sql_insert(users, doctors):
    """Generate SQL insert statements"""
    sql_users = "INSERT INTO users (email, password, first_name, last_name, phone_number, gender, role, date_of_birth, address) VALUES\n"
    user_values = []
    for user in users:
        values = f"('{user['email']}', '{user['password']}', '{user['firstName']}', '{user['lastName']}', '{user['phoneNumber']}', '{user['gender']}', '{user['role']}', '{user['dateOfBirth']}', '{user['address']}')"
        user_values.append(values)
    
    sql_users += ",\n".join(user_values) + ";\n\n"
    
    sql_doctors = "INSERT INTO doctor (specialization, degree, phone_number, chamber_address, designation, institute, current_city, available_time, website_url, status, user_email) VALUES\n"
    doctor_values = []
    for doc in doctors:
        specs = json.dumps(doc['specialization']).replace('"', '\\"')
        degrees = json.dumps(doc['degree']).replace('"', '\\"')
        phones = json.dumps(doc['phoneNumber']).replace('"', '\\"')
        website = f"'{doc['websiteUrl']}'" if doc['websiteUrl'] else "NULL"
        
        values = f"('{specs}', '{degrees}', '{phones}', '{doc['chamberAddress']}', '{doc['designation']}', '{doc['institute']}', '{doc['currentCity']}', '{doc['availableTime']}', {website}, '{doc['status']}', '{doc['email']}')"
        doctor_values.append(values)
    
    sql_doctors += ",\n".join(doctor_values) + ";"
    
    return sql_users + sql_doctors

if __name__ == "__main__":
    print("Generating 1000+ Bangladeshi doctors...")
    users, doctors = generate_doctors(1050)  # Generate 1050 to be safe
    
    # Save as JSON for inspection
    with open("doctors_data.json", "w") as f:
        json.dump({"users": users, "doctors": doctors}, f, indent=2)
    print(f"✅ Generated {len(doctors)} doctors - saved to doctors_data.json")
    
    # Generate SQL
    sql = generate_sql_insert(users, doctors)
    with open("V2__Insert_1000_Bangladesh_Doctors.sql", "w") as f:
        f.write(sql)
    print(f"✅ SQL migration created: V2__Insert_1000_Bangladesh_Doctors.sql")
    print(f"Total records: {len(users)} users + {len(doctors)} doctors")
