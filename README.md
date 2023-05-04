# gpt-man
Chrome Extension to Automate ChatGPT to write full Documents such as a Business Plan based on Context you give it via file uploads

## WORK IN PROGRESS

Currently can only upload .txt files

When it errors out it usually does it in 3's lol (probalby a loop code smell on my end) it will try to fix it so sit still.

If it stops typing for more than a few minutes then it's probably broken broken lol.

No typing sounds = bad or process complete

## Notes

The interval it loops at is 10 seconds, this is to try and attempt to prevent a rate limit. The rate limit isn't just questions asked, it also takes into account how many tokens have been sent into that rate. So...10 seconds...cross your fingers. It looks slow, but its magic.

# Installation

Ask chat-gpt how to install a custom chrome extension, you want to "Load Unpacked" the entire folder that was downloaded.

# The Good Shit

If it installed correctly you will see a panel on the right side, click inside the page in the first 1-2 seconds to get sounds.

If you don't have sounds you didn't click fast enough :p

# Getting Started

To begin, upload some files containing the context of yo sheeeeeit

## Context

That fills the context section in the panel, this is like your short term memory AKA context. Once that is generated you can enter a document name and click create doc.

The sound will walk you through the process, I made her custom...you're welcome :p
