# Running the MOBILE version

works on my phone (iphone xs), no idea if it will work on others

https is needed

generate self signed ssl certificate

`openssl req -new -x509 -keyout key.pem -out cert.pem -days 365 -nodes`

(openssl needs to be installed, should be easy on linux, should be possible on windows)

run python https file server included in this repo

`python .\serve.py`

u need to make this server accessible on your local wifi

localhost is not enough because you cannot connect your phone to your pc's localhost

u need to find your local ip address

on windows use `ipconfig`, on linux something similiar should exists

in `serve.py` put your local ip address to `HOST` variable on line 4