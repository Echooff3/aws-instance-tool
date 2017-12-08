#! /usr/bin/env node
const blessed = require('blessed')
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
    //Populate List
    var displayList = instances.map(x => {
        return [x.name[0] || 'undefined',x.dns,x.key]
    })
    displayList.unshift([ 'Instance',  'DNS', 'PEM'  ])
    list.setData(displayList)
    list.focus()
    // Render the screen. 
    screen.render();
})

// Create a screen object. 
var screen = blessed.screen({
 smartCSR: true
});

screen.title = 'aws instances';

// Create a box perfectly centered horizontally and vertically. 
var list = blessed.listtable({
 top: 'center',
 left: 'center',
 width: '100%',
 height: '100%',
 mouse: true,
 border: {
   type: 'line'
 },
 style: {
   fg: 'white',
   bg: 'cyan',
   border: {
     fg: '#f0f0f0'
   },
   hover: {
     bg: 'green'
   }
 }
});

// Append our box to the screen. 
screen.append(list);

// // Add a png icon to the box 
// var icon = blessed.image({
//  parent: box,
//  top: 0,
//  left: 0,
//  type: 'overlay',
//  width: 'shrink',
//  height: 'shrink',
//  file: __dirname + '/my-program-icon.png',
//  search: false
// });

list.on('select', (item,index) => {
    var i = instances[index]
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
})

// // If our box is clicked, change the content. 
// list.on('click', function(data) {
// //  box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
//  screen.render();
// });

// // If box is focused, handle `enter`/`return` and give us some more content. 
// list.key('enter', function(ch, key) {
// //  box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
// //  box.setLine(1, 'bar');
// //  box.insertLine(1, 'foo');
//  screen.render();
// });

// Quit on Escape, q, or Control-C. 
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
 return process.exit(0);
});
