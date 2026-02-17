import os, requests, json

token = os.environ['VERCEL_TOKEN']
url = "https://api.vercel.com/v6/deployments?limit=1"
headers = {"Authorization": f"Bearer {token}"}

resp = requests.get(url, headers=headers)
data = resp.json()

if 'deployments' in data and len(data['deployments']) > 0:
    dep = data['deployments'][0]
    dep_id = dep['id']
    
    # Get build logs
    logs_url = f"https://api.vercel.com/v2/deployments/{dep_id}/events"
    logs_resp = requests.get(logs_url, headers=headers)
    
    print("Recent deployment errors:")
    for line in logs_resp.text.split('\n')[-50:]:
        if line.strip() and ('error' in line.lower() or 'failed' in line.lower()):
            try:
                evt = json.loads(line)
                if 'text' in evt:
                    print(evt['text'])
            except:
                print(line[:200])
