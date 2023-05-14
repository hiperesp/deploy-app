# Deploy.app.br

## Screenshots

### Login Screen
![Login](/docs/images/login.png)

### Namespace Screen
![Namespaces](/docs/images/namespaces.png)

### Apps Screen
![Apps](/docs/images/apps.png)

### App Overview Screen
![App Overview](/docs/images/app-overview.png)

### App Overview Screen - Deploy option
![App Overview with deploy option](/docs/images/app-overview-deploy.png)

### App Overview Screen - Access logs, error logs, app logs
![App Access Logs](/docs/images/app-access-logs.png)
![App Error Logs](/docs/images/app-error-logs.png)
![App Logs](/docs/images/app-logs.png)

### App Overview Screen - General Settings
![Apps](/docs/images/app-settings-general.png)

### App Overview Screen - Scaling Settings
![Apps](/docs/images/app-settings-scaling.png)

### App Overview Screen - Ports Settings
![Apps](/docs/images/app-settings-ports.png)

### App Overview Screen - Environment Variables Settings
![Apps](/docs/images/app-settings-env.png)

## About

Deploy.app.br is a beautiful UI for Dokku. It's a work in progress, but it's already usable.

You can use it to manage your Dokku apps, deploy new apps, manage your app settings, and more.

## How to use

### Requirements

- Dokku Server (https://dokku.com/docs/getting-started/installation) with SSH access

- Dokku Let's Encrypt plugin (optional, but recommended to enable https)

### Installation

Choose a name for your app, and create it on Dokku server. We will use `host` as an example.\
Get a domain for your app. We will use `mydomain.com` as an example.



```sh
# Connect to your Dokku server via SSH.

# If you connected using a dokku user, you can skip this step. If you connected using a non-dokku user, execute the following command to enter in dokku shell:
dokku shell

# Let's create our app:
apps:create host

# Now we will sync our app with the latest version of Deploy-app:
git:sync host https://github.com/hiperesp/Deploy.app.br.git main --build

# Now we will configure our app ports:
proxy:ports-set host http:80:3000

# Now we will define our app domain. If you have configured a global domain on your Dokku server, you can skip this step. If you don't have a global domain, you can use the following command to add a domain to your app:
domains:add host mydomain.com

# If you want to enable https or if your domain uses HSTS, you need to enable letsencrypt plugin.
letsencrypt:enable host

```
Now we will configure the namespaces and the refresh interval.\
Change the following json with your namespaces. Please double check if your json is valid.\
You can use https://jsonlint.com/ to validate your json.

```json
[
    {
        "name": "your-namespace",
        
        "server_host": "0.0.0.0",
        "server_port": "22",
        "server_username": "dokku",
        "server_privateKey": "-----BEGIN OPENSSH PRIVATE KEY-----\nINSERT\nYOUR\nPRIVATE\nKEY\nHERE\nLIKE\nTHIS\n-----END OPENSSH PRIVATE KEY-----"
    }
]
```
```sh
# Now we will save the namespaces on our app.
# You need to encode your namespaces json to base64.
# You can use https://www.base64encode.org/ to encode your json.
config:set host --encoded NAMESPACES=ClsKICAgIHsKICAgICAgICAibmFtZSI6ICJ5b3VyLW5hbWVzcGFjZSIsCiAgICAgICAgCiAgICAgICAgInNlcnZlcl9ob3N0IjogIjAuMC4wLjAiLAogICAgICAgICJzZXJ2ZXJfcG9ydCI6ICIyMiIsCiAgICAgICAgInNlcnZlcl91c2VybmFtZSI6ICJkb2trdSIsCiAgICAgICAgInNlcnZlcl9wcml2YXRlS2V5IjogIi0tLS0tQkVHSU4gT1BFTlNTSCBQUklWQVRFIEtFWS0tLS0tXG5JTlNFUlRcbllPVVJcblBSSVZBVEVcbktFWVxuSEVSRVxuTElLRVxuVEhJU1xuLS0tLS1FTkQgT1BFTlNTSCBQUklWQVRFIEtFWS0tLS0tIgogICAgfQpd

# Let's configure the refresh interval, the admin user and the admin password. You can use the following commands to set the admin user and password:
config:set host REFRESH_INTERVAL=600 AUTH_USER=admin AUTH_PASSWORD=yourpassword
```
Now, you can access your app using your defined domain.

## How to update
Access your app using your defined domain then open the namespace of this app.

Open this app and click on "Deploy" button. Fill the "git ref" field with "main" or the app version that you want to deploy.

The app will be updated and restarted.

If you don't see the "Deploy" button, you need to go to your app settings, at the "General Settings" tab, you can see the "Git Settings" section.\
You need to set the "Remote" field with the following value: `https://github.com/hiperesp/Deploy.app.br.git` and the "Ref" field with `main`.

Now save, and you will see the "Deploy" button.

## Built with
- Dokku 🐳
- Node.js 💚
- TypeScript 💙

## Made by

[Gabriel Lopes](https://github.com/hiperesp)

# Special thanks

- Dokku - the software that makes this project possible.
- Ledokku - the inspiration for this project.
- PlanetScale - the inspiration for the design.
