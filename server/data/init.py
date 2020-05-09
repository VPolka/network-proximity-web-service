import sqlite3 as sql

con = sql.connect('data/data.db')
with con:
    cur = con.cursor()

    cur.execute("CREATE TABLE IF NOT EXISTS users ('id' STRING, 'type' STRING, 'name' STRING, 'courses' STRING)")
    cur.execute("CREATE TABLE IF NOT EXISTS courses ('name' STRING, 'owner_address' STRING, 'students' STRING, 'attendance' STRING)")
    cur.execute("CREATE TABLE IF NOT EXISTS open_courses ('name' STRING, 'date' STRING, 'students' STRING)")

    con.commit()
    cur.close()