from pymongo import MongoClient

uri = "mongodb+srv://quratmanzoor662_db_user:Mongopassword662@cluster0.dbjwxdz.mongodb.net/mehtab_bakery?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(uri)

print(client.admin.command("ping"))
print("Connected")