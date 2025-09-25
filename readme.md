Input :
{
"mapName": "Office",
"agents": [
{ "start": { "x": 0, "y": 0 }, "end": { "x": 4, "y": 4 } },
{ "start": { "x": 1, "y": 0 }, "end": { "x": 3, "y": 4 } }
]
}

Output:
{
"success": true,
"map": "Office",
"totalAgents": 2,
"results": [
{
"agentId": 1,
"start": {
"x": 0,
"y": 0
},
"end": {
"x": 4,
"y": 4
},
"path": [
{
"x": 0,
"y": 0
},
{
"x": 1,
"y": 0
},
{
"x": 2,
"y": 0
},
{
"x": 2,
"y": 1
},
{
"x": 2,
"y": 2
},
{
"x": 3,
"y": 2
},
{
"x": 4,
"y": 2
},
{
"x": 4,
"y": 3
},
{
"x": 4,
"y": 4
}
],
"steps": 9
},
{
"agentId": 2,
"start": {
"x": 1,
"y": 0
},
"end": {
"x": 3,
"y": 4
},
"path": [
{
"x": 1,
"y": 0
},
{
"x": 2,
"y": 0
},
{
"x": 2,
"y": 1
},
{
"x": 2,
"y": 2
},
{
"x": 2,
"y": 3
},
{
"x": 2,
"y": 4
},
{
"x": 3,
"y": 4
}
],
"steps": 7
}
]
}


Invalid Start : (on Wall)
{
    "success": true,
    "map": "Office",
    "totalAgents": 2,
    "results": [
        {
            "agentId": 1,
            "start": {
                "x": 3,
                "y": 0
            },
            "end": {
                "x": 4,
                "y": 4
            },
            "path": [],
            "steps": 0,
            "error": "Invalid start point: (3,0) is out of bounds or on a wall"
        },
        {
            "agentId": 2,
            "start": {
                "x": 1,
                "y": 0
            },
            "end": {
                "x": 4,
                "y": 4
            },
            "path": [
                {
                    "x": 1,
                    "y": 0
                },
                {
                    "x": 2,
                    "y": 0
                },
                {
                    "x": 2,
                    "y": 1
                },
                {
                    "x": 2,
                    "y": 2
                },
                {
                    "x": 3,
                    "y": 2
                },
                {
                    "x": 4,
                    "y": 2
                },
                {
                    "x": 4,
                    "y": 3
                },
                {
                    "x": 4,
                    "y": 4
                }
            ],
            "steps": 8
        }
    ]
}

Invalid End : (On Wall)
{
    "success": true,
    "map": "Office",
    "totalAgents": 2,
    "results": [
        {
            "agentId": 1,
            "start": {
                "x": 0,
                "y": 0
            },
            "end": {
                "x": 3,
                "y": 0
            },
            "path": [],
            "steps": 0,
            "error": "Invalid end point: (3,0) is out of bounds or on a wall"
        },
        {
            "agentId": 2,
            "start": {
                "x": 1,
                "y": 0
            },
            "end": {
                "x": 4,
                "y": 4
            },
            "path": [
                {
                    "x": 1,
                    "y": 0
                },
                {
                    "x": 2,
                    "y": 0
                },
                {
                    "x": 2,
                    "y": 1
                },
                {
                    "x": 2,
                    "y": 2
                },
                {
                    "x": 3,
                    "y": 2
                },
                {
                    "x": 4,
                    "y": 2
                },
                {
                    "x": 4,
                    "y": 3
                },
                {
                    "x": 4,
                    "y": 4
                }
            ],
            "steps": 8
        }
    ]
}


Invalid :
{
    "success": true,
    "map": "Office",
    "totalAgents": 2,
    "results": [
        {
            "agentId": 1,
            "start": {
                "x": 250,
                "y": 450
            },
            "end": {
                "x": 4,
                "y": 1
            },
            "path": [],
            "steps": 0,
            "error": "Invalid start point: (250,450) is out of bounds or on a wall"
        },
        {
            "agentId": 2,
            "start": {
                "x": 1,
                "y": 0
            },
            "end": {
                "x": 526,
                "y": 75
            },
            "path": [],
            "steps": 0,
            "error": "Invalid end point: (526,75) is out of bounds or on a wall"
        }
    ]
}