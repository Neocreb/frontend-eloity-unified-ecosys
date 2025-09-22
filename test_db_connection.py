import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the database URL from environment variables
database_url = os.getenv('DATABASE_URL')

# Try with the standard Supabase format instead of db.subdomain
if 'db.' in database_url:
    standard_url = database_url.replace('db.', '')
    print(f"Attempting to connect to standard URL: {standard_url}")
    
    try:
        # Attempt to connect to the database with standard URL
        conn = psycopg2.connect(standard_url)
        print("Successfully connected to the database with standard URL!")
        
        # Create a cursor
        cur = conn.cursor()
        
        # Execute a simple query
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(f"Database version: {version[0]}")
        
        # Close the cursor and connection
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error connecting to database with standard URL: {e}")

print(f"Attempting to connect to: {database_url}")

try:
    # Attempt to connect to the database
    conn = psycopg2.connect(database_url)
    print("Successfully connected to the database!")
    
    # Create a cursor
    cur = conn.cursor()
    
    # Execute a simple query
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print(f"Database version: {version[0]}")
    
    # Close the cursor and connection
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error connecting to database: {e}")