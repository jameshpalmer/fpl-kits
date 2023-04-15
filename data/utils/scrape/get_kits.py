"""
This script scrapes the data for all the kits in the Premier League from the
Pulse API. It returns a list of dictionaries, each containing the data for a
single kit.
"""

import requests
import asyncio
import aiohttp

async def fetch_content(page_number):
    url = f"https://footballapi.pulselive.com/content/PremierLeague/photo/EN/?pageSize=100&tagNames=PL%20Kits&page={page_number}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers={"Origin": "https://www.premierleague.com"}) as response:
            return await response.json()

async def get_content(num_pages):
    tasks = [fetch_content(page_number) for page_number in range(1, num_pages)]
    results = await asyncio.gather(*tasks)
    content = [result['content'] for result in results]
    return content

def flatten_list_of_dicts(lst):
    result = []
    for item in lst:
        if isinstance(item, dict):
            result.append(item)
        elif isinstance(item, list):
            result.extend(flatten_list_of_dicts(item))
    return result


def main():
    """
    Get all kit data from the Pulse API.
    """
    url = "https://footballapi.pulselive.com/content/PremierLeague/photo/EN/?pageSize=100&tagNames=PL%20Kits"
    headers = {"Origin": "https://www.premierleague.com"}
    response = requests.get(url, headers=headers)
    data = response.json()

    content = data['content']

    num_pages = data['pageInfo']['numPages']
    if num_pages > 1:
        loop = asyncio.get_event_loop()
        content += loop.run_until_complete(get_content(num_pages))

    return flatten_list_of_dicts(content)
