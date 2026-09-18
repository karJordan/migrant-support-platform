require('dotenv').config();

const pool = require('../../db');
const getCategoryId = require('./getCategoryId');

async function seedJobs() {
    try {
        const categoryMap = {
            customerService: await getCategoryId('Customer Service', 'job'),
            administration: await getCategoryId('Other', 'job'),
            warehouse: await getCategoryId('Other', 'job'),
        };

        const rows = [
            {
                title: 'Customer Service Representative',
                company: 'Auckland Community Services',
                location: 'Auckland',
                employment_type: 'Full Time',
                description: 'Support customers by phone and email and help resolve general enquiries.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.customerService,
            },
            {
                title: 'Administrative Assistant',
                company: 'Wellington Support Network',
                location: 'Wellington',
                employment_type: 'Part Time',
                description: 'Provide administrative support, maintain records, and assist with scheduling.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.administration,
            },
            {
                title: 'Warehouse Team Member',
                company: 'South Island Logistics',
                location: 'Christchurch',
                employment_type: 'Casual',
                description: 'Assist with receiving, organising, and preparing stock for distribution.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
            {
                title: 'Customer Support Advisor',
                company: 'Kiwi Utilities Group',
                location: 'Hamilton',
                employment_type: 'Full Time',
                description: 'Handle inbound enquiries about power and broadband services and resolve account issues.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.customerService,
            },
            {
                title: 'Call Centre Operator',
                company: 'National Healthline',
                location: 'Auckland',
                employment_type: 'Full Time',
                description: 'Respond to healthline calls, triage enquiries, and refer callers to appropriate services.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.customerService,
            },
            {
                title: 'Front Desk Receptionist',
                company: 'Wellington Community Trust',
                location: 'Wellington',
                employment_type: 'Part Time',
                description: 'Greet visitors, manage bookings, and provide general information about trust services.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.customerService,
            },
            {
                title: 'Client Services Coordinator',
                company: 'Canterbury Family Support',
                location: 'Christchurch',
                employment_type: 'Full Time',
                description: 'Coordinate client intake, schedule appointments, and maintain accurate case records.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.customerService,
            },
            {
                title: 'Office Administrator',
                company: 'Auckland Legal Associates',
                location: 'Auckland',
                employment_type: 'Full Time',
                description: 'Manage office supplies, process invoices, and provide administrative support to the team.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.administration,
            },
            {
                title: 'Data Entry Clerk',
                company: 'National Statistics Office',
                location: 'Wellington',
                employment_type: 'Part Time',
                description: 'Enter and verify data from survey forms and maintain accurate digital records.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.administration,
            },
            {
                title: 'Scheduling Coordinator',
                company: 'Southern Home Care',
                location: 'Dunedin',
                employment_type: 'Full Time',
                description: 'Coordinate staff rosters and client visits and manage scheduling changes.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.administration,
            },
            {
                title: 'Records Assistant',
                company: 'Waikato District Council',
                location: 'Hamilton',
                employment_type: 'Casual',
                description: 'Assist with filing, digitising records, and maintaining the council archives.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.administration,
            },
            {
                title: 'Payroll Administrator',
                company: 'Bay of Plenty Enterprises',
                location: 'Tauranga',
                employment_type: 'Full Time',
                description: 'Process weekly payroll, maintain employee records, and handle payroll enquiries.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.administration,
            },
            {
                title: 'Warehouse Storeperson',
                company: 'North Island Distribution',
                location: 'Auckland',
                employment_type: 'Full Time',
                description: 'Pick, pack, and dispatch orders and maintain accurate inventory records.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
            {
                title: 'Forklift Operator',
                company: 'Canterbury Freight Services',
                location: 'Christchurch',
                employment_type: 'Full Time',
                description: 'Operate forklifts to move stock, load trucks, and assist with inventory counts.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
            {
                title: 'Inventory Assistant',
                company: 'Wellington Logistics Hub',
                location: 'Wellington',
                employment_type: 'Part Time',
                description: 'Conduct stock counts, update inventory systems, and report discrepancies.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
            {
                title: 'Dispatch Coordinator',
                company: 'South Island Logistics',
                location: 'Christchurch',
                employment_type: 'Full Time',
                description: 'Coordinate outbound shipments, prepare documentation, and liaise with drivers.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
            {
                title: 'Packing Team Member',
                company: 'Otago Produce Distributors',
                location: 'Dunedin',
                employment_type: 'Casual',
                description: 'Pack fresh produce for distribution and ensure orders meet quality standards.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
            {
                title: 'Stockroom Assistant',
                company: 'Waikato Retail Group',
                location: 'Hamilton',
                employment_type: 'Part Time',
                description: 'Receive deliveries, organise the stockroom, and replenish shelves as required.',
                status: 'approved',
                created_by: null,
                category_id: categoryMap.warehouse,
            },
        ];

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let inserted = 0;
            for (const row of rows) {
                const result = await client.query(
                    `INSERT INTO jobs
                        (title, company, location, employment_type, description, status, created_by, category_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (title, company) DO NOTHING`,
                    [
                        row.title,
                        row.company,
                        row.location,
                        row.employment_type,
                        row.description,
                        row.status,
                        row.created_by,
                        row.category_id,
                    ]
                );
                inserted += result.rowCount;
            }

            await client.query('COMMIT');
            console.log(`Job seed complete. ${inserted} inserted, ${rows.length - inserted} skipped.`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        process.exitCode = 1;
        console.error('Job seed failed:', error.message);
    } finally {
        await pool.end();
    }
}

seedJobs();