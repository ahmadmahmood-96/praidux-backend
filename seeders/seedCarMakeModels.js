require("dotenv").config();
const mongoose = require("mongoose");
const CarMake = require("../models/carMakes"); // adjust path if needed

// Your car make + model data
const carModelsByMake = {
    Toyota: [
        "Corolla", "Premio", "Axio", "Fielder", "Probox", "Noah",
        "Voxy", "Land Cruiser", "Hilux", "RAV4", "Passo",
        "Harrier", "Hiace", "Alphard", "Wish",
    ],
    Nissan: [
        "Note", "X-Trail", "Navara", "March", "Juke",
        "Teana", "Wingroad", "Caravan", "Dualis", "Serena",
    ],
    Honda: ["Fit", "Vezel", "Civic", "Accord", "CR-V", "Freed", "Stream"],
    Mazda: ["Demio", "Axela", "CX-5", "BT-50", "Atenza", "Premacy"],
    Mitsubishi: ["Outlander", "Pajero", "Lancer", "Canter", "Fuso", "RVR"],
    Subaru: ["Forester", "Impreza", "Legacy", "Outback", "XV", "Exiga"],
    Isuzu: ["D-Max", "NKR", "FRR", "NPR", "FTR", "Trooper"],
    Suzuki: ["Alto", "Swift", "Wagon R", "Escudo", "Jimny", "Every"],
    Hyundai: ["Tucson", "Santa Fe", "Elantra", "Accent", "H1", "i10"],
    Kia: ["Sportage", "Sorento", "Rio", "Picanto", "Cerato", "Carens"],
    Ford: ["Ranger", "Everest", "EcoSport", "Focus", "Fiesta"],
    Volkswagen: ["Golf", "Passat", "Jetta", "Tiguan", "Touareg", "Polo"],
    Peugeot: ["206", "207", "208", "307", "308", "Partner", "Boxer"],
    BMW: ["3 Series", "5 Series", "X1", "X3", "X5", "X6"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC", "Actros", "Sprinter"],
    Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
    "Land Rover": ["Range Rover", "Discovery", "Defender", "Freelander"],
    Chevrolet: ["Cruze", "Trailblazer", "Captiva", "Spark"],
    Daihatsu: ["Mira", "Terios", "Hijet", "Move"],
    Renault: ["Duster", "Kwid", "Logan", "Clio"],
    Tata: ["Indica", "Manza", "Safari", "Xenon", "407"],
    Mahindra: ["Scorpio", "XUV500", "Bolero", "Thar"],
    "Great Wall": ["Wingle", "Steed", "Hover"],
    Foton: ["Tunland", "View", "Aumark"],
    Changan: ["Alsvin", "CS35", "Eado"],
    Geely: ["Emgrand", "Coolray", "Azkarra"],
    Fiat: ["Punto", "Doblo", "500", "Fiorino"],
    Proton: ["Saga", "Persona", "Preve"],
    SsangYong: ["Actyon", "Korando", "Rexton"],
    Jeep: ["Wrangler", "Cherokee", "Compass", "Renegade"],
};

const seed = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/hikar", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Connected to MongoDB");

        // Clear existing makes if needed
        await CarMake.deleteMany({});
        console.log("🗑 Existing car makes cleared");

        // Insert new data
        const makes = Object.entries(carModelsByMake).map(([name, models]) => ({
            name,
            models,
        }));

        await CarMake.insertMany(makes);
        console.log("🚀 Car makes seeded successfully");

        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed", err);
        process.exit(1);
    }
};

seed();