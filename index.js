#! /usr/bin/env node
const vorpal = require('vorpal')()
const AWS = require('aws-sdk')
const ec2 = new AWS.EC2()
const { spawn } = require('child_process')
const ncp = require("copy-paste")
var instances = []
console.log(`Gathering Instances ...`)
ec2.describeInstances({
    Filters: [
        {
            Name: "instance-state-name",
            Values: ["running"]
        }
    ]
}, (error, data) => {
    if (error) {
        console.log(error)
        return
    }
    instances = data.Reservations.map((y, i) => {
        return y.Instances.map(x => {
            return {
                index: i,
                dns: x.PublicDnsName,
                key: x.KeyName,
                name: x.Tags.filter(x => { return x.Key == "Name" })
                    .map(x => { return x.Value }),
                os: x.Tags.filter(x => { return x.Key == "OS" })
                    .map(x => { return x.Value }) || 'ec2-user'
            }
        })
    })
        .reduce((a, b) => { return a.concat(b) })

    vorpal
        .delimiter('aws$')
        .show();
})

vorpal
    .command('list', 'Lists Running Instances')
    .action((args, callback) => {
        instances.forEach(x => {
            console.log(`${x.index} - ${x.name}`)
        })
        callback()
    });
vorpal
    .command('ssh <index>', 'Connect to instance by index (see list)')
    .action((args, callback) => {
        var i = instances[args.index]
        if (i) {
            ncp.copy(`ssh -i ${process.env.C}/${i.key}.pem ${i.os.length > 0 ? i.os[0] : 'ec2-user'}@${i.dns}`,
                () => {
                    process.exit(0)
                })

            //console.log(`ssh -i ${process.env.C}/${i.key}.pem ${i.os.length > 0 ? i.os[0] : 'ec2-user'}@${i.dns}`)
            // const ssh = spawn('ssh', ['-i', `${process.env.C}/${i.key}.pem`, `${i.os.length > 0 ? i.os[0] : 'ec2-user'}@${i.dns}`]);

            // ssh.stdout.on('data', (data) => {
            //   console.log(`stdout: ${data}`);
            // });

            // ssh.stderr.on('data', (data) => {
            //   console.log(`stderr: ${data}`);
            // });

            // ssh.on('close', (code) => {
            //   console.log(`child process exited with code ${code}`);
            // });
        } else {
            console.log(`No Instance at index ${args.index}`)
            callback()
        }
    });

