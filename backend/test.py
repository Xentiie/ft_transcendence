import requests

token = input('Token: ')

x = requests.get(`${config.backend_url}/api/chat/me`, headers={"Authorization": f"Bearer {token}"})
print(x.json())