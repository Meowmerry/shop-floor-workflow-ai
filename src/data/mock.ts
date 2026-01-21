[
    {
        "id": "ORD-2024-001-ITEM-001",
        "orderId": "ORD-2024-001",
        "name": "6\" Steel Pipe Section",
        "description": "Carbon steel, Schedule 40",
        "quantity": 12,
        "currentStep": "Saw",
        "status": "In Progress",
        "onHold": false,
        "priority": "High",
        "auditHistory": [
            {
                "id": "yg1fed6b4",
                "timestamp": "2026-01-21T22:11:53.152Z",
                "step": "Saw",
                "action": "Started cutting",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson",
                "notes": "Batch 1 of 3"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-001-ITEM-002",
        "orderId": "ORD-2024-001",
        "name": "4\" Steel Pipe Section",
        "description": "Carbon steel, Schedule 80",
        "quantity": 8,
        "currentStep": "Saw",
        "status": "Pending",
        "onHold": false,
        "priority": "Normal",
        "auditHistory": [],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-001-ITEM-003",
        "orderId": "ORD-2024-001",
        "name": "2\" Threaded Coupling",
        "description": "Galvanized steel",
        "quantity": 24,
        "currentStep": "Thread",
        "status": "In Progress",
        "onHold": false,
        "priority": "Normal",
        "auditHistory": [
            {
                "id": "ztaohchy1",
                "timestamp": "2026-01-20T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed cutting",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "xwuocmh59",
                "timestamp": "2026-01-21T22:11:53.153Z",
                "step": "Thread",
                "action": "Started threading",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-002-ITEM-001",
        "orderId": "ORD-2024-002",
        "name": "Custom Flange Assembly",
        "description": "150# RF Flange, 6\" bore",
        "quantity": 4,
        "currentStep": "CNC",
        "status": "In Progress",
        "onHold": false,
        "priority": "Urgent",
        "auditHistory": [
            {
                "id": "yyfsadovv",
                "timestamp": "2026-01-18T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "m1on2fz9p",
                "timestamp": "2026-01-19T22:11:53.153Z",
                "step": "Thread",
                "action": "Completed",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "goyqv1yom",
                "timestamp": "2026-01-21T22:11:53.153Z",
                "step": "CNC",
                "action": "Started machining",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera",
                "notes": "Complex tolerance requirements"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-002-ITEM-002",
        "orderId": "ORD-2024-002",
        "name": "Reducer Bushing Set",
        "description": "4\" to 2\" NPT",
        "quantity": 16,
        "currentStep": "QC",
        "status": "Pending",
        "onHold": true,
        "holdReason": "Documentation Missing",
        "priority": "High",
        "auditHistory": [
            {
                "id": "r5c4mv2xi",
                "timestamp": "2026-01-17T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "ujuykzzas",
                "timestamp": "2026-01-18T22:11:53.153Z",
                "step": "Thread",
                "action": "Completed",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "f2zas2toc",
                "timestamp": "2026-01-19T22:11:53.153Z",
                "step": "CNC",
                "action": "Completed",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera"
            },
            {
                "id": "qs4gp3hqu",
                "timestamp": "2026-01-20T22:11:53.153Z",
                "step": "QC",
                "action": "Placed on hold",
                "operatorId": "QC-201",
                "operatorName": "Emily Watson",
                "notes": "Awaiting material certs"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-003-ITEM-001",
        "orderId": "ORD-2024-003",
        "name": "Pressure Vessel Cap",
        "description": "ASME rated, 300 PSI",
        "quantity": 2,
        "currentStep": "Ship",
        "status": "Pending",
        "onHold": false,
        "priority": "Normal",
        "auditHistory": [
            {
                "id": "u32j5l7cp",
                "timestamp": "2026-01-16T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "7vh4u4wjo",
                "timestamp": "2026-01-17T22:11:53.153Z",
                "step": "Thread",
                "action": "Completed",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "apqos9man",
                "timestamp": "2026-01-18T22:11:53.153Z",
                "step": "CNC",
                "action": "Completed",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera"
            },
            {
                "id": "j00lueb59",
                "timestamp": "2026-01-19T22:11:53.153Z",
                "step": "QC",
                "action": "Passed inspection",
                "operatorId": "QC-201",
                "operatorName": "Emily Watson"
            },
            {
                "id": "1xy7lqjtm",
                "timestamp": "2026-01-20T22:11:53.153Z",
                "step": "Ship",
                "action": "Ready for packaging",
                "operatorId": "SH-301",
                "operatorName": "David Miller"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-003-ITEM-002",
        "orderId": "ORD-2024-003",
        "name": "Support Bracket Assembly",
        "description": "Heavy duty, zinc plated",
        "quantity": 6,
        "currentStep": "QC",
        "status": "In Progress",
        "onHold": false,
        "priority": "Normal",
        "auditHistory": [
            {
                "id": "a3gz21lbs",
                "timestamp": "2026-01-17T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "g5j6hjkvv",
                "timestamp": "2026-01-18T22:11:53.153Z",
                "step": "Thread",
                "action": "Completed",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "ia83otbkn",
                "timestamp": "2026-01-19T22:11:53.153Z",
                "step": "CNC",
                "action": "Completed",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera"
            },
            {
                "id": "a3xapahq2",
                "timestamp": "2026-01-21T22:11:53.153Z",
                "step": "QC",
                "action": "Inspection started",
                "operatorId": "QC-201",
                "operatorName": "Emily Watson"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-003-ITEM-003",
        "orderId": "ORD-2024-003",
        "name": "Mounting Plate",
        "description": "12\" x 12\" x 0.5\" steel",
        "quantity": 6,
        "currentStep": "Ship",
        "status": "Completed",
        "onHold": false,
        "priority": "Low",
        "auditHistory": [
            {
                "id": "cgdnbxmez",
                "timestamp": "2026-01-15T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "0gfhfsa3v",
                "timestamp": "2026-01-16T22:11:53.153Z",
                "step": "Thread",
                "action": "N/A - Skip",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "zutgcrr7d",
                "timestamp": "2026-01-17T22:11:53.153Z",
                "step": "CNC",
                "action": "Completed",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera"
            },
            {
                "id": "pea8w5i8g",
                "timestamp": "2026-01-18T22:11:53.153Z",
                "step": "QC",
                "action": "Passed",
                "operatorId": "QC-201",
                "operatorName": "Emily Watson"
            },
            {
                "id": "m2gtgnuy1",
                "timestamp": "2026-01-19T22:11:53.153Z",
                "step": "Ship",
                "action": "Packaged and labeled",
                "operatorId": "SH-301",
                "operatorName": "David Miller"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-004-ITEM-001",
        "orderId": "ORD-2024-004",
        "name": "Hydraulic Manifold Block",
        "description": "Aluminum 6061-T6",
        "quantity": 3,
        "currentStep": "Saw",
        "status": "Pending",
        "onHold": true,
        "holdReason": "Customer Request",
        "priority": "Urgent",
        "auditHistory": [
            {
                "id": "e4x9628k1",
                "timestamp": "2026-01-21T22:11:53.153Z",
                "step": "Saw",
                "action": "On hold - drawings",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson",
                "notes": "Customer requested changes"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-004-ITEM-002",
        "orderId": "ORD-2024-004",
        "name": "End Cap - Type A",
        "description": "Stainless 316",
        "quantity": 10,
        "currentStep": "Thread",
        "status": "Pending",
        "onHold": false,
        "priority": "High",
        "auditHistory": [
            {
                "id": "g8udlbf3y",
                "timestamp": "2026-01-20T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-004-ITEM-003",
        "orderId": "ORD-2024-004",
        "name": "End Cap - Type B",
        "description": "Stainless 316",
        "quantity": 10,
        "currentStep": "Saw",
        "status": "In Progress",
        "onHold": false,
        "priority": "High",
        "auditHistory": [
            {
                "id": "pxdkvprya",
                "timestamp": "2026-01-21T22:11:53.153Z",
                "step": "Saw",
                "action": "Started",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-005-ITEM-001",
        "orderId": "ORD-2024-005",
        "name": "Pipe Nipple Assembly",
        "description": "3\" NPT x 6\" long",
        "quantity": 20,
        "currentStep": "Ship",
        "status": "In Progress",
        "onHold": false,
        "priority": "Normal",
        "auditHistory": [
            {
                "id": "3nb33mmbq",
                "timestamp": "2026-01-14T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "z4tw3va6b",
                "timestamp": "2026-01-15T22:11:53.153Z",
                "step": "Thread",
                "action": "Completed",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "y23g16ric",
                "timestamp": "2026-01-16T22:11:53.153Z",
                "step": "CNC",
                "action": "N/A - Skip",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera"
            },
            {
                "id": "dp17kbj5n",
                "timestamp": "2026-01-17T22:11:53.153Z",
                "step": "QC",
                "action": "Passed",
                "operatorId": "QC-201",
                "operatorName": "Emily Watson"
            },
            {
                "id": "ps675w9xf",
                "timestamp": "2026-01-21T22:11:53.153Z",
                "step": "Ship",
                "action": "Packaging in progress",
                "operatorId": "SH-301",
                "operatorName": "David Miller"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    },
    {
        "id": "ORD-2024-005-ITEM-002",
        "orderId": "ORD-2024-005",
        "name": "Union Connector",
        "description": "3\" NPT, brass",
        "quantity": 20,
        "currentStep": "Ship",
        "status": "Completed",
        "onHold": false,
        "priority": "Normal",
        "auditHistory": [
            {
                "id": "llaig9xns",
                "timestamp": "2026-01-13T22:11:53.153Z",
                "step": "Saw",
                "action": "Completed",
                "operatorId": "OP-101",
                "operatorName": "Mike Johnson"
            },
            {
                "id": "fhgo3yra1",
                "timestamp": "2026-01-14T22:11:53.153Z",
                "step": "Thread",
                "action": "Completed",
                "operatorId": "OP-102",
                "operatorName": "Sarah Chen"
            },
            {
                "id": "497bbo29j",
                "timestamp": "2026-01-15T22:11:53.153Z",
                "step": "CNC",
                "action": "Completed",
                "operatorId": "OP-103",
                "operatorName": "Carlos Rivera"
            },
            {
                "id": "jqjwmrhrs",
                "timestamp": "2026-01-16T22:11:53.153Z",
                "step": "QC",
                "action": "Passed",
                "operatorId": "QC-201",
                "operatorName": "Emily Watson"
            },
            {
                "id": "g1b9ne7xh",
                "timestamp": "2026-01-20T22:11:53.153Z",
                "step": "Ship",
                "action": "Shipped",
                "operatorId": "SH-301",
                "operatorName": "David Miller",
                "notes": "Tracking: 1Z999AA10123456784"
            }
        ],
        "createdAt": "2026-01-14T22:11:53.153Z",
        "updatedAt": "2026-01-21T22:11:53.153Z"
    }
]