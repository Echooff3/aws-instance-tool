# aws-instance-tool
Copies SSH String to clipboard

Assumes you have the environmental variables set for
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY
* AWS_REGION
* C [Location to pem files]

# installation
```bash
npm install -g https://github.com/Echooff3/aws-instance-tool.git
```

# usage
```bash
$ aws-tool
aws$ help

  Commands:

    help [command...]  Provides help for a given command.
    exit               Exits application.
    list               Lists Running Instances
    ssh <index>        Connect to instance by index (see list)

aws$
```
