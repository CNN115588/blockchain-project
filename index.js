/**
 * @fileoverview This script simulates key smart contract functionalities for a food supply chain
 * on a blockchain. It is a conceptual demonstration in JavaScript and does not
 * represent a live blockchain or real smart contract execution.
 *
 * It includes:
 * - A simulated "blockchain" (an array of transaction records).
 * - Logic for a Fair Pricing Smart Contract.
 * - Logic for a Food Delivery and Storage Conditions Verification Smart Contract.
 * - Sample data representing different stages of a food product's journey.
 */

// --- 1. Simulated Blockchain Data Structure ---
// In a real blockchain, these would be immutable blocks linked cryptographically.
// Here, it's an array of transaction objects for demonstration purposes.
let simulatedBlockchain = [];
let nextTransactionId = 1001; // Starting ID for transactions

/**
 * Represents a single transaction or event in the simulated food supply chain.
 * @typedef {Object} Transaction
 * @property {number} id - Unique identifier for the transaction.
 * @property {string} actorId - Identifier of the participant performing the action (e.g., 'farmer_001').
 * @property {string} productId - Unique identifier for the food product or batch.
 * @property {string} timestamp - ISO string representing the time of the event.
 * @property {string} location - Geotagging or descriptive location of the event.
 * @property {string} eventType - Type of event (e.g., 'HARVEST', 'PROCESS', 'TRANSPORT', 'DELIVER').
 * @property {Object} details - Specific details relevant to the event type.
 * @property {boolean} [details.qualityVerified] - For FAIR_PRICING, indicates if quality is verified.
 * @property {boolean} [details.deliveryConfirmed] - For FAIR_PRICING, indicates if delivery is confirmed.
 * @property {number} [details.quantityKg] - For FAIR_PRICING, quantity in kilograms.
 * @property {number} [details.agreedPricePerKg] - For FAIR_PRICING, agreed price per kg.
 * @property {number} [details.currentTempCelsius] - For CONDITIONS_VERIFICATION, current temperature.
 * @property {number} [details.currentHumidityPercent] - For CONDITIONS_VERIFICATION, current humidity.
 * @property {Object} [details.thresholds] - For CONDITIONS_VERIFICATION, min/max thresholds.
 * @property {number} [details.thresholds.minTemp]
 * @property {number} [details.thresholds.maxTemp]
 * @property {number} [details.thresholds.minHumidity]
 * @property {number} [details.thresholds.maxHumidity]
 */

/**
 * Adds a new transaction to the simulated blockchain.
 * In a real blockchain, this would involve hashing and cryptographic linking.
 * @param {Transaction} transactionData - The data for the new transaction.
 * @returns {Transaction} The added transaction with an assigned ID.
 */
function addTransaction(transactionData) {
    const newTransaction = {
        id: nextTransactionId++,
        ...transactionData,
        timestamp: new Date().toISOString() // Ensure consistent timestamp
    };
    simulatedBlockchain.push(newTransaction);
    console.log(`[Blockchain] Added Transaction ${newTransaction.id}: ${newTransaction.eventType} for Product ${newTransaction.productId}`);
    return newTransaction;
}


// --- 2. Fair Pricing Smart Contract Simulation ---

/**
 * Simulates the logic of a Fair Pricing Smart Contract.
 * It checks if delivery and quality are confirmed to release a payment.
 * @param {Transaction} paymentTransaction - The transaction related to payment processing.
 * @returns {Object} An object indicating payment status and amount.
 */
function processFairPricing(paymentTransaction) {
    const { qualityVerified, deliveryConfirmed, quantityKg, agreedPricePerKg, spoilageRate = 0.15 } = paymentTransaction.details;

    // Check for prior condition violations
    const recentViolations = simulatedBlockchain.filter(tx =>
        tx.productId === paymentTransaction.productId &&
        tx.details &&
        tx.details.violationDetected
    );

    let spoilage = 0;
    if (recentViolations.length > 0) {
        spoilage = spoilageRate * quantityKg;
    }

    if (qualityVerified && deliveryConfirmed) {
        const adjustedQty = quantityKg - spoilage;
        const totalPayment = adjustedQty * agreedPricePerKg;

        console.log(`  [Fair Pricing] Violation found: ${recentViolations.length > 0 ? 'Yes' : 'No'}`);
        console.log(`  [Fair Pricing] Payment released for Product ${paymentTransaction.productId}. Spoilage: ${spoilage.toFixed(2)} kg. Amount: ₦${totalPayment.toFixed(2)}`);
        
        return { status: 'Payment Released', amount: totalPayment };
    } else if (!qualityVerified) {
        console.log(`  [Fair Pricing] Payment pending for Product ${paymentTransaction.productId}: Quality not yet verified.`);
        return { status: 'Quality Pending', amount: 0 };
    } else if (!deliveryConfirmed) {
        console.log(`  [Fair Pricing] Payment pending for Product ${paymentTransaction.productId}: Delivery not yet confirmed.`);
        return { status: 'Delivery Pending', amount: 0 };
    } else {
        return { status: 'Pending', amount: 0 };
    }
}

// --- 3. Food Delivery and Storage Conditions Verification Smart Contract Simulation ---

/**
 * Simulates the logic of a Food Conditions Verification Smart Contract.
 * It checks if current conditions meet predefined thresholds.
 * @param {Transaction} conditionTransaction - The transaction containing condition data.
 * @returns {Object} An object indicating condition status and any violations.
 */
function verifyFoodConditions(conditionTransaction) {
    const { currentTempCelsius, currentHumidityPercent, thresholds } = conditionTransaction.details;
    const { minTemp, maxTemp, minHumidity, maxHumidity } = thresholds;

    let status = 'Conditions Met';
    let violations = [];

    if (currentTempCelsius < minTemp || currentTempCelsius > maxTemp) {
        status = 'Condition Violation';
        violations.push(`Temperature violation: ${currentTempCelsius}°C (expected ${minTemp}-${maxTemp}°C)`);
    }
    if (currentHumidityPercent < minHumidity || currentHumidityPercent > maxHumidity) {
        status = 'Condition Violation';
        violations.push(`Humidity violation: ${currentHumidityPercent}% (expected ${minHumidity}-${maxHumidity}%)`);
    }

    if (violations.length > 0) {
        console.log(`  [Conditions] For Product ${conditionTransaction.productId} at ${conditionTransaction.location}: ${status}. Violations: ${violations.join(', ')}`);
        return { status: status, violations: violations };
    } else {
        console.log(`  [Conditions] For Product ${conditionTransaction.productId} at ${conditionTransaction.location}: ${status}. Current Temp: ${currentTempCelsius}°C, Humidity: ${currentHumidityPercent}%`);
        return { status: status, violations: [] };
    }
}


// --- Sample Data for Testing ---

const sampleData = [
    {
        eventType: 'HARVEST',
        actorId: 'farmer_001',
        productId: 'TOMATO_BATCH_001',
        location: 'Kano Farm Plot A',
        details: {
            cropType: 'Tomato',
            plantingDate: '2025-01-15',
            harvestDate: '2025-05-20',
            quantityKg: 500,
            initialQuality: 'Good'
        }
    },
    {
        eventType: 'TRANSPORT',
        actorId: 'logistics_NGR_001',
        productId: 'TOMATO_BATCH_001',
        location: 'En route to Lagos Warehouse',
        details: {
            vehicleId: 'TRUCK_A123',
            departureTime: '2025-05-20T10:00:00Z',
            arrivalTime: '2025-05-21T08:00:00Z',
            currentTempCelsius: 22,
            currentHumidityPercent: 70,
            thresholds: { minTemp: 18, maxTemp: 25, minHumidity: 60, maxHumidity: 80 }
        }
    },
    {
        eventType: 'WAREHOUSE_RECEIPT',
        actorId: 'warehouse_Lagos_001',
        productId: 'TOMATO_BATCH_001',
        location: 'Lagos Central Warehouse',
        details: {
            receiptTime: '2025-05-21T08:30:00Z',
            storageSection: 'Refrigerated Unit 5',
            currentTempCelsius: 20,
            currentHumidityPercent: 65,
            thresholds: { minTemp: 18, maxTemp: 22, minHumidity: 60, maxHumidity: 75 }
        }
    },
    {
        eventType: 'PROCESS',
        actorId: 'processor_NGR_001',
        productId: 'TOMATO_BATCH_001',
        location: 'Lagos Processing Plant',
        details: {
            processingDate: '2025-05-22',
            processedInto: 'Tomato Paste Jar 250g',
            batchNo: 'TPJ-20250522-001',
            qualityControl: 'Passed',
            quantityKg: 450 // Loss during processing
        }
    },
    {
        eventType: 'TRANSPORT',
        actorId: 'logistics_NGR_002',
        productId: 'TPJ-20250522-001',
        location: 'En route to Abuja Retailer',
        details: {
            vehicleId: 'VAN_B456',
            departureTime: '2025-05-23T09:00:00Z',
            arrivalTime: '2025-05-24T18:00:00Z',
            currentTempCelsius: 30, // Simulate a temperature violation
            currentHumidityPercent: 50,
            thresholds: { minTemp: 20, maxTemp: 28, minHumidity: 40, maxHumidity: 60 }
        }
    },
    {
        eventType: 'RETAIL_RECEIPT',
        actorId: 'retailer_Abuja_001',
        productId: 'TPJ-20250522-001',
        location: 'Abuja SuperMart',
        details: {
            receiptTime: '2025-05-24T18:30:00Z',
            displayConditions: 'Shelf',
            currentTempCelsius: 25,
            currentHumidityPercent: 55,
            thresholds: { minTemp: 20, maxTemp: 30, minHumidity: 40, maxHumidity: 60 }
        }
    },
    {
        eventType: 'PAYMENT_REQUEST',
        actorId: 'farmer_001',
        productId: 'TOMATO_BATCH_001',
        location: 'Kano Farm Office',
        details: {
            buyerId: 'processor_NGR_001',
            quantityKg: 500,
            agreedPricePerKg: 350, // Nigerian Naira
            qualityVerified: true,
            deliveryConfirmed: false // Simulate pending delivery
        }
    },
    {
        eventType: 'PAYMENT_REQUEST', // Re-sending with delivery confirmed
        actorId: 'farmer_001',
        productId: 'TOMATO_BATCH_001',
        location: 'Kano Farm Office',
        details: {
            buyerId: 'processor_NGR_001',
            quantityKg: 500,
            agreedPricePerKg: 350,
            qualityVerified: true,
            deliveryConfirmed: true // Now confirmed
            spoilageRate: 0.15 // <-- New line
        }
    }, 
       {
    eventType: 'HARVEST',
    actorId: 'farmer_002',
    productId: 'ONION_BATCH_002',
    location: 'Kaduna Farm Block B',
    details: {
        cropType: 'Onion',
        plantingDate: '2025-02-10',
        harvestDate: '2025-06-15',
        quantityKg: 300,
        initialQuality: 'Very Good'
    }
},
{
    eventType: 'TRANSPORT',
    actorId: 'logistics_NGR_003',
    productId: 'ONION_BATCH_002',
    location: 'En route to Enugu Warehouse',
    details: {
        vehicleId: 'TRUCK_X789',
        departureTime: '2025-06-15T11:00:00Z',
        arrivalTime: '2025-06-16T10:00:00Z',
        currentTempCelsius: 24,
        currentHumidityPercent: 72,
        thresholds: { minTemp: 20, maxTemp: 26, minHumidity: 60, maxHumidity: 80 }
    }
},
{
    eventType: 'WAREHOUSE_RECEIPT',
    actorId: 'warehouse_Enugu_002',
    productId: 'ONION_BATCH_002',
    location: 'Enugu Agro Warehouse',
    details: {
        receiptTime: '2025-06-16T10:30:00Z',
        storageSection: 'Ventilated Zone 2',
        currentTempCelsius: 22,
        currentHumidityPercent: 65,
        thresholds: { minTemp: 20, maxTemp: 25, minHumidity: 60, maxHumidity: 75 }
    }
},
{
    eventType: 'PROCESS',
    actorId: 'processor_NGR_003',
    productId: 'ONION_BATCH_002',
    location: 'Enugu Processing Center',
    details: {
        processingDate: '2025-06-17',
        processedInto: 'Dried Onion Flakes 100g',
        batchNo: 'DOF-20250617-002',
        qualityControl: 'Passed',
        quantityKg: 270
    }
},
{
    eventType: 'RETAIL_RECEIPT',
    actorId: 'retailer_Enugu_003',
    productId: 'DOF-20250617-002',
    location: 'Enugu Market Stall 9',
    details: {
        receiptTime: '2025-06-18T09:00:00Z',
        displayConditions: 'Ambient',
        currentTempCelsius: 28,
        currentHumidityPercent: 58,
        thresholds: { minTemp: 18, maxTemp: 30, minHumidity: 40, maxHumidity: 60 }
    }
},
{
    eventType: 'PAYMENT_REQUEST',
    actorId: 'farmer_002',
    productId: 'ONION_BATCH_002',
    location: 'Kaduna Farm Block B',
    details: {
        buyerId: 'processor_NGR_003',
        quantityKg: 300,
        agreedPricePerKg: 400,
        qualityVerified: true,
        deliveryConfirmed: true
    }
}

    
];


// --- Main Simulation Loop ---

async function runSimulation() {
    console.log("--- Starting Food Supply Chain Blockchain Simulation ---");
    console.log("\n--- Processing Sample Data ---");

    for (const data of sampleData) {
        console.log(`\nProcessing Event: ${data.eventType} by ${data.actorId} for ${data.productId}`);
        const newTx = addTransaction(data);

        // Simulate smart contract interactions based on event type
        if (newTx.eventType === 'PAYMENT_REQUEST') {
            console.log(`  [Smart Contract Call] Invoking Fair Pricing Contract for Transaction ${newTx.id}`);
            processFairPricing(newTx);
        } else if (newTx.eventType === 'TRANSPORT' || newTx.eventType === 'WAREHOUSE_RECEIPT' || newTx.eventType === 'RETAIL_RECEIPT') {
            if (newTx.details.currentTempCelsius !== undefined && newTx.details.currentHumidityPercent !== undefined && newTx.details.thresholds) {
                console.log(`  [Smart Contract Call] Invoking Conditions Verification Contract for Transaction ${newTx.id}`);
                verifyFoodConditions(newTx);
            }
        }
    }

    console.log("\n--- Simulation Complete ---");
    console.log("\n--- Final Simulated Blockchain State (showing all transactions) ---");
    console.log(JSON.stringify(simulatedBlockchain, null, 2));
}

// Run the simulation
runSimulation();
