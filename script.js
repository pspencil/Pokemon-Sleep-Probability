// script.js

// --- 1. Data Structures ---
const ingredients = [
    { name: "AAA", probability: 1 / 9 },
    { name: "AAB", probability: 1 / 9 },
    { name: "AAC", probability: 1 / 9 },
    { name: "ABA", probability: 2 / 9 },
    { name: "ABB", probability: 2 / 9 },
    { name: "ABC", probability: 2 / 9 },
];

const skills = [
    { name: "Berry Finding S", rarity: "Gold", prob: 0.02 },
    { name: "Dream Shard Bonus", rarity: "Gold", prob: 0.02 },
    { name: "Energy Recovery Bonus", rarity: "Gold", prob: 0.02 },
    { name: "Helping Bonus", rarity: "Gold", prob: 0.02 },
    { name: "Research EXP Bonus", rarity: "Gold", prob: 0.02 },
    { name: "Skill Level Up M", rarity: "Gold", prob: 0.02 },
    { name: "Sleep EXP Bonus", rarity: "Gold", prob: 0.02 },

    { name: "Helping Speed M", rarity: "Blue", prob: 0.06 },
    { name: "Ingredient Finder M", rarity: "Blue", prob: 0.06 },
    { name: "Inventory Up L", rarity: "Blue", prob: 0.06 },
    { name: "Inventory Up M", rarity: "Blue", prob: 0.06 },
    { name: "Skill Level Up S", rarity: "Blue", prob: 0.06 },
    { name: "Skill Trigger M", rarity: "Blue", prob: 0.06 },

    { name: "Helping Speed S", rarity: "White", prob: 0.125 },
    { name: "Ingredient Finder S", rarity: "White", prob: 0.125 },
    { name: "Inventory Up S", rarity: "White", prob: 0.125 },
    { name: "Skill Trigger S", rarity: "White", prob: 0.125 },
];

const natures = [
    { name: "Lonely", boost: "Speed of Help +10%", reduction: "Energy Recovery -12%" },
    { name: "Adamant", boost: "Speed of Help +10%", reduction: "Ingredient Finding -20%" },
    { name: "Naughty", boost: "Speed of Help +10%", reduction: "Main Skill Chance - 20%" },
    { name: "Brave", boost: "Speed of Help +10%", reduction: "EXP Gains -18%" },
    { name: "Bold", boost: "Energy Recovery +20%", reduction: "Speed of Help -10%" },
    { name: "Impish", boost: "Energy Recovery +20%", reduction: "Ingredient Finding -20%" },
    { name: "Lax", boost: "Energy Recovery +20%", reduction: "Main Skill Chance - 20%" },
    { name: "Relaxed", boost: "Energy Recovery +20%", reduction: "EXP Gains -18%" },
    { name: "Modest", boost: "Ingredient Finding +20%", reduction: "Speed of Help -10%" },
    { name: "Mild", boost: "Ingredient Finding +20%", reduction: "Energy Recovery -12%" },
    { name: "Rash", boost: "Ingredient Finding +20%", reduction: "Main Skill Chance - 20%" },
    { name: "Quiet", boost: "Ingredient Finding +20%", reduction: "EXP Gains -18%" }, // Corrected Quiet nature
    { name: "Calm", boost: "Main Skill Chance + 20%", reduction: "Speed of Help -10%" },
    { name: "Gentle", boost: "Main Skill Chance + 20%", reduction: "Energy Recovery -12%" },
    { name: "Careful", boost: "Main Skill Chance + 20%", reduction: "Ingredient Finding -20%" },
    { name: "Sassy", boost: "Main Skill Chance + 20%", reduction: "EXP Gains -18%" },
    { name: "Timid", boost: "EXP Gains +18%", reduction: "Speed of Help -10%" },
    { name: "Hasty", boost: "EXP Gains +18%", reduction: "Energy Recovery -12%" },
    { name: "Jolly", boost: "EXP Gains +18%", reduction: "Ingredient Finding -20%" },
    { name: "Naive", boost: "EXP Gains +18%", reduction: "Main Skill Chance - 20%" },
    // Neutral Natures
    { name: "Bashful", boost: null, reduction: null },
    { name: "Hardy", boost: null, reduction: null },
    { name: "Docile", boost: null, reduction: null },
    { name: "Quirky", boost: null, reduction: null },
    { name: "Serious", boost: null, reduction: null },
];
// Each nature has a probability of 1/25 (total 25 natures)
natures.forEach(n => n.probability = 1 / natures.length);


// Nature effect categories for scoring
const NATURE_EFFECT_CATEGORIES = [
    "Speed of Help",
    "Energy Recovery",
    "Ingredient Finding",
    "Main Skill Chance",
    "EXP Gains"
];

// Default scoring configuration
let scoringConfig = {
    ingredientScores: {},
    skillScores: {}, // Base scores for all skills
    natureBoostScores: {},
    natureReductionScores: {},
    conditionalSkillScores: [], // { condition: { skillName: "X" }, targetSkill: "Y", scoreIfTrue: Z, scoreIfFalse: W }
    sameSkillGroups: [] // Groups of skills where we don't add, but just take highest. 
};

// Populate default scores with 0
ingredients.forEach(ing => scoringConfig.ingredientScores[ing.name] = 0);
skills.forEach(skill => scoringConfig.skillScores[skill.name] = 0);
NATURE_EFFECT_CATEGORIES.forEach(cat => {
    scoringConfig.natureBoostScores[cat] = 0;
    scoringConfig.natureReductionScores[cat] = 0;
});


// Example Presets (can be expanded)
const presets = {
    "Berry": {
        ingredientScores: { "AAA": 0, "AAB": 0, "AAC": 0, "ABA": 0, "ABB": 0, "ABC": 0 },
        skillScores: {
            "Berry Finding S": 4.3, "Helping Bonus": 0.5, "Energy Recovery Bonus": 0,
            "Helping Speed M": 1.2, "Ingredient Finder M": 0, "Skill Trigger M": 0,
            "Helping Speed S": 0.6, "Ingredient Finder S": 0, "Skill Trigger S": 0,
            "Skill Level Up S": 0, "Skill Level Up M": 0,
            "Inventory Up S": 0, "Inventory Up M": 0, "Inventory Up L": 0,
            "Dream Shard Bonus": 0, "Research EXP Bonus": 0, "Sleep EXP Bonus": 0.3
        },
        natureBoostScores: {
            "Speed of Help": 0.9, "Energy Recovery": 0, "Ingredient Finding": -0.3,
            "Main Skill Chance": 0, "EXP Gains": 0
        },
        natureReductionScores: {
            "Speed of Help": -0.9, "Energy Recovery": 0, "Ingredient Finding": 0.3,
            "Main Skill Chance": 0, "EXP Gains": 0
        },
        conditionalSkillScores: [
            { condition: { skillName: "Berry Finding S" }, targetSkill: "Helping Bonus", scoreIfTrue: 1, scoreIfFalse: 0 }
        ],
        sameSkillGroups: []
    },
    "AAA": {
        ingredientScores: { "AAA": 0.8, "AAB": -10, "AAC": -10, "ABA": -10, "ABB": -10, "ABC": -10 },
        skillScores: {
            "Berry Finding S": 0.2, "Helping Bonus": 0.3, "Energy Recovery Bonus": 0,
            "Helping Speed M": 0.8, "Ingredient Finder M": 1.8, "Skill Trigger M": 0,
            "Helping Speed S": 0.4, "Ingredient Finder S": 0.9, "Skill Trigger S": 0,
            "Skill Level Up S": 0, "Skill Level Up M": 0,
            "Inventory Up S": 0.1, "Inventory Up M": 0.2, "Inventory Up L": 0.3,
            "Dream Shard Bonus": 0, "Research EXP Bonus": 0, "Sleep EXP Bonus": 0.3
        },
        natureBoostScores: {
            "Speed of Help": 0.6, "Energy Recovery": 0, "Ingredient Finding": 1,
            "Main Skill Chance": 0, "EXP Gains": 0
        },
        natureReductionScores: {
            "Speed of Help": -0.4, "Energy Recovery": 0, "Ingredient Finding": -1,
            "Main Skill Chance": 0, "EXP Gains": 0
        },
        conditionalSkillScores: [
            { condition: { skillName: "Ingredient Finder M" }, targetSkill: "Inventory Up L", scoreIfTrue: 0.3, scoreIfFalse: 0 },
            { condition: { skillName: "Ingredient Finder M" }, targetSkill: "Inventory Up M", scoreIfTrue: 0.2, scoreIfFalse: 0 },
            { condition: { skillName: "Ingredient Finder M" }, targetSkill: "Inventory Up M", scoreIfTrue: 0.1, scoreIfFalse: 0 },
            { condition: { skillName: "Ingredient Finder M" }, targetSkill: "Helping Bonus", scoreIfTrue: 1, scoreIfFalse: 0 }
        ],
        sameSkillGroups: [
            ["Inventory Up L", "Inventory Up M", "Inventory Up S"]
        ]
    },
    "Skill": {
        ingredientScores: { "AAA": 0, "AAB": 0, "AAC": 0, "ABA": 0, "ABB": 0, "ABC": 0 },
        skillScores: {
            "Berry Finding S": 0.2, "Helping Bonus": 0.3, "Energy Recovery Bonus": 0,
            "Helping Speed M": 0.9, "Ingredient Finder M": 0, "Skill Trigger M": 1.8,
            "Helping Speed S": 0.4, "Ingredient Finder S": 0, "Skill Trigger S": 0.9,
            "Skill Level Up S": 0.2, "Skill Level Up M": 0.4,
            "Inventory Up S": 0.1, "Inventory Up M": 0.2, "Inventory Up L": 0.3,
            "Dream Shard Bonus": 0, "Research EXP Bonus": 0, "Sleep EXP Bonus": 0.3
        },
        natureBoostScores: {
            "Speed of Help": 0.6, "Energy Recovery": 0, "Ingredient Finding": 0,
            "Main Skill Chance": 1, "EXP Gains": 0
        },
        natureReductionScores: {
            "Speed of Help": -0.4, "Energy Recovery": 0, "Ingredient Finding": 0,
            "Main Skill Chance": -1, "EXP Gains": 0
        },
        conditionalSkillScores: [
            { condition: { skillName: "Skill Trigger M" }, targetSkill: "Helping Bonus", scoreIfTrue: 1, scoreIfFalse: 0 },
            { condition: { skillName: "Skill Trigger M" }, targetSkill: "Berry Finding S", scoreIfTrue: 0.3, scoreIfFalse: 0 }
        ],
        sameSkillGroups: [
            ["Inventory Up L", "Inventory Up M", "Inventory Up S"],
            ["Skill Level Up M", "Skill Level Up S"],
        ]
    },
};

// --- Optimization: Global memoized score distribution and max score ---
let memoizedScoreDistribution = []; // Stores objects like { score: number, probability: number }
let currentMaxScore = 0; // The highest score encountered in the current configuration

// --- 2. UI Elements and Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        populateScoringInputs();
        populatePresets();
        await loadPreset("Berry"); // Load a default preset on start and await precomputation
        attachTabListeners();
        attachCalculatorListeners();
        attachGraphingListeners();
        attachGraphingDropdownListeners(); // Attach the new listener for graphing dropdowns
        updateXAxisOptions(); // Call initially to set correct options based on default fixed var
    } catch (error) {
        console.error("Error during DOMContentLoaded setup:", error);
        showModal("An error occurred during initial setup. Please check the console for details.");
    }
});

function populateScoringInputs() {
    const ingredientInputsDiv = document.getElementById('ingredient-score-inputs');
    ingredients.forEach(ing => {
        ingredientInputsDiv.innerHTML += `
            <div>
                <label for="score-ing-${ing.name}">${ing.name}:</label>
                <input type="number" id="score-ing-${ing.name}" data-prop-type="ingredient" data-prop-name="${ing.name}" value="${scoringConfig.ingredientScores[ing.name]}">
            </div>
        `;
    });

    const skillInputsDiv = document.getElementById('skill-score-inputs');
    skills.forEach(skill => {
        skillInputsDiv.innerHTML += `
            <div>
                <label for="score-skill-${skill.name.replace(/\s/g, '-')}" title="${skill.name}">${skill.name}:</label>
                <input type="number" id="score-skill-${skill.name.replace(/\s/g, '-')}" data-prop-type="skill" data-prop-name="${skill.name}" value="${scoringConfig.skillScores[skill.name]}">
            </div>
        `;
    });

    const natureBoostInputsDiv = document.getElementById('nature-boost-score-inputs');
    NATURE_EFFECT_CATEGORIES.forEach(cat => {
        natureBoostInputsDiv.innerHTML += `
            <div>
                <label for="score-nat-boost-${cat.replace(/\s/g, '-')}">${cat} (Boost):</label>
                <input type="number" id="score-nat-boost-${cat.replace(/\s/g, '-')}" data-prop-type="nature-boost" data-prop-name="${cat}" value="${scoringConfig.natureBoostScores[cat]}">
            </div>
        `;
    });

    const natureReductionInputsDiv = document.getElementById('nature-reduction-score-inputs');
    NATURE_EFFECT_CATEGORIES.forEach(cat => {
        natureReductionInputsDiv.innerHTML += `
            <div>
                <label for="score-nat-reduct-${cat.replace(/\s/g, '-')}">${cat} (Reduction):</label>
                <input type="number" id="score-nat-reduct-${cat.replace(/\s/g, '-')}" data-prop-type="nature-reduction" data-prop-name="${cat}" value="${scoringConfig.natureReductionScores[cat]}">
            </div>
        `;
    });

    // Add event listeners for score inputs
    document.querySelectorAll('#scoring-config input[type="number"]').forEach(input => {
        input.addEventListener('change', updateScoringConfigFromUI);
    });

    renderConditionalRules();
}

function populatePresets() {
    const presetSelect = document.getElementById('preset-select');
    presetSelect.innerHTML = ''; // Clear existing options
    for (const name in presets) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        presetSelect.appendChild(option);
    }
}

async function loadPreset(presetName) {
    if (presets[presetName]) {
        scoringConfig = JSON.parse(JSON.stringify(presets[presetName])); // Deep copy
        // Update UI with new scores
        document.querySelectorAll('#scoring-config input[type="number"]').forEach(input => {
            const propType = input.dataset.propType;
            const propName = input.dataset.propName;
            if (propType === 'ingredient') {
                input.value = scoringConfig.ingredientScores[propName] || 0;
            } else if (propType === 'skill') {
                input.value = scoringConfig.skillScores[propName] || 0;
            } else if (propType === 'nature-boost') {
                input.value = scoringConfig.natureBoostScores[propName] || 0;
            } else if (propType === 'nature-reduction') {
                input.value = scoringConfig.natureReductionScores[propName] || 0;
            }
        });
        renderConditionalRules(); // Re-render conditional rules based on new config
        document.getElementById('preset-select').value = presetName; // Select the loaded preset in dropdown
        // Removed showModal for "Preset loaded!"
        await precomputeScoreDistribution(); // Trigger re-computation after loading new preset
    } else {
        showModal("Preset not found!");
    }
}

async function saveCurrentPreset() {
    const presetName = prompt("Enter a name for your preset:"); // Using prompt for simplicity, could be a modal
    if (presetName) {
        // Ensure to get current values from UI inputs
        await updateScoringConfigFromUI(); // Sync UI values to scoringConfig and trigger precompute
        presets[presetName] = JSON.parse(JSON.stringify(scoringConfig)); // Deep copy
        populatePresets(); // Refresh preset dropdown
        // Select the newly saved preset
        document.getElementById('preset-select').value = presetName;
        // Removed showModal for "Preset saved!"
        // No need to call precomputeScoreDistribution here as updateScoringConfigFromUI already does it.
    }
}

async function updateScoringConfigFromUI() {
    document.querySelectorAll('#ingredient-score-inputs input').forEach(input => {
        scoringConfig.ingredientScores[input.dataset.propName] = parseFloat(input.value) || 0;
    });
    document.querySelectorAll('#skill-score-inputs input').forEach(input => {
        scoringConfig.skillScores[input.dataset.propName] = parseFloat(input.value) || 0;
    });
    document.querySelectorAll('#nature-boost-score-inputs input').forEach(input => {
        scoringConfig.natureBoostScores[input.dataset.propName] = parseFloat(input.value) || 0;
    });
    document.querySelectorAll('#nature-reduction-score-inputs input').forEach(input => {
        scoringConfig.natureReductionScores[input.dataset.propName] = parseFloat(input.value) || 0;
    });
    // Conditional rules are updated via renderConditionalRules and add/remove handlers
    await precomputeScoreDistribution(); // Trigger re-computation after config changes
}

function renderConditionalRules() {
    const container = document.getElementById('conditional-rules-container');
    container.innerHTML = ''; // Clear existing rules

    scoringConfig.conditionalSkillScores.forEach((rule, index) => {
        const ruleDiv = document.createElement('div');
        ruleDiv.classList.add('conditional-rule-item');
        ruleDiv.innerHTML = `
            <label>If skill:</label>
            <select data-type="condition-skill" data-index="${index}">
                ${skills.map(s => `<option value="${s.name}" ${rule.condition.skillName === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
            <label>is present, then skill:</label>
            <select data-type="target-skill" data-index="${index}">
                ${skills.map(s => `<option value="${s.name}" ${rule.targetSkill === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
            <label>gets +</label>
            <input type="number" data-type="score-if-true" data-index="${index}" value="${rule.scoreIfTrue || 0}">
            <label>otherwise +</label>
            <input type="number" data-type="score-if-false" data-index="${index}" value="${rule.scoreIfFalse || 0}">
            <button class="remove-conditional-rule-btn" data-index="${index}">Remove</button>
        `;
        container.appendChild(ruleDiv);
    });

    document.querySelectorAll('.conditional-rule-item select, .conditional-rule-item input[type="number"]').forEach(input => {
        input.addEventListener('change', async (e) => {
            const index = parseInt(e.target.dataset.index);
            const type = e.target.dataset.type;
            if (type === 'condition-skill') {
                scoringConfig.conditionalSkillScores[index].condition.skillName = e.target.value;
            } else if (type === 'target-skill') {
                scoringConfig.conditionalSkillScores[index].targetSkill = e.target.value;
            } else if (type === 'score-if-true') {
                scoringConfig.conditionalSkillScores[index].scoreIfTrue = parseFloat(e.target.value) || 0;
            } else if (type === 'score-if-false') {
                scoringConfig.conditionalSkillScores[index].scoreIfFalse = parseFloat(e.target.value) || 0;
            }
            await precomputeScoreDistribution(); // Recompute after any conditional rule change
        });
    });

    document.querySelectorAll('.remove-conditional-rule-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const index = parseInt(e.target.dataset.index);
            scoringConfig.conditionalSkillScores.splice(index, 1);
            renderConditionalRules(); // Re-render to update indices
            await precomputeScoreDistribution(); // Recompute after removal
        });
    });
}

async function addConditionalRule() {
    scoringConfig.conditionalSkillScores.push({
        condition: { skillName: skills[0].name }, // Default to first skill
        targetSkill: skills[0].name,             // Default to first skill
        scoreIfTrue: 0,
        scoreIfFalse: 0
    });
    renderConditionalRules();
    await precomputeScoreDistribution(); // Recompute after adding a new rule
}

function attachTabListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });
}

function attachCalculatorListeners() {
    document.getElementById('load-preset-btn').addEventListener('click', () => {
        const selectedPreset = document.getElementById('preset-select').value;
        loadPreset(selectedPreset);
    });
    document.getElementById('save-current-preset-btn').addEventListener('click', saveCurrentPreset);
    document.getElementById('add-conditional-rule-btn').addEventListener('click', addConditionalRule);
    document.getElementById('calculate-btn').addEventListener('click', handleCalculate);
}

function attachGraphingListeners() {
    document.getElementById('generate-graph-btn').addEventListener('click', generateGraph);
}

function attachGraphingDropdownListeners() {
    const fixedVarSelect = document.getElementById('fixed-graph-var');
    fixedVarSelect.addEventListener('change', updateXAxisOptions);
}

function updateXAxisOptions() {
    const fixedVarSelect = document.getElementById('fixed-graph-var');
    const xAxisSelect = document.getElementById('x-axis-var');
    const fixedVar = fixedVarSelect.value;

    // Clear existing options
    xAxisSelect.innerHTML = '';

    // Define options based on the fixed variable
    const options = {
        'P': [
            { value: 'X', text: 'Encounters (X)' },
            { value: 'C', text: 'Min Score (C)' }
        ],
        'X': [
            { value: 'P', text: 'Probability (P)' },
            { value: 'C', text: 'Min Score (C)' }
        ],
        'C': [
            { value: 'P', text: 'Probability (P)' },
            { value: 'X', text: 'Encounters (X)' }
        ]
    };

    // Populate X-axis options
    options[fixedVar].forEach(optionData => {
        const option = document.createElement('option');
        option.value = optionData.value;
        option.textContent = optionData.text;
        xAxisSelect.appendChild(option);
    });
}


// Helper to parse nature descriptions (e.g., "Speed of Help +10%")
function parseNatureEffect(description) {
    if (!description) return { category: null, value: 0 };
    for (const category of NATURE_EFFECT_CATEGORIES) {
        if (description.includes(category)) {
            // Extracts the number and converts it to a float
            const match = description.match(/([+-]?\d+\.?\d*)%?/) // Regex to capture optional sign, digits, decimal, and %
            return { category: category, value: match ? parseFloat(match[1]) : 0 };
        }
    }
    return { category: null, value: 0 }; // No recognized category
}


// --- 3. Core Calculation Logic ---


/**
 * Generates all unique combinations of N skills from the given pool.
 * @param {Array<Object>} skillPool - The array of skill objects.
 * @param {number} n - The number of skills to pick.
 * @returns {Array<Array<Object>>} An array of arrays, each inner array being a combination of skill objects.
 */
function getCombinations(arr, k) {
    const result = [];
    function backtrack(startIndex, currentCombination) {
        if (currentCombination.length === k) {
            result.push([...currentCombination]);
            return;
        }
        for (let i = startIndex; i < arr.length; i++) {
            currentCombination.push(arr[i]);
            backtrack(i + 1, currentCombination);
            currentCombination.pop();
        }
    }
    backtrack(0, []);
    return result;
}

/**
 * Calculates the probability of a specific ordered sequence of skills (without replacement).
 * P(S_k | not S_1, ..., S_{k-1}) = P(S_k) / (1 - sum_{j=1}^{k-1} P(S_j))
 * @param {Array<string>} sequenceOfSkillNames - An ordered array of skill names.
 * @returns {number} The probability of this specific sequence occurring.
 */
function calculateSequenceProbability(sequenceOfSkillNames) {
    let probability = 1.0;
    let sumOfProbsOfDrawnSkills = 0.0;
    const skillNameMap = new Map(skills.map(s => [s.name, s])); // For quick lookup

    for (let i = 0; i < sequenceOfSkillNames.length; i++) {
        const skillName = sequenceOfSkillNames[i];
        const skill = skillNameMap.get(skillName);

        if (!skill) {
            console.error(`Skill not found in pool: ${skillName}`);
            return 0; // Should not happen with correct data
        }

        // The denominator for conditional probability: sum of probabilities of skills *remaining* in the pool.
        // It's 1 - sum of probabilities of skills *already drawn*.
        const currentPoolProbSum = 1.0 - sumOfProbsOfDrawnSkills;

        if (currentPoolProbSum <= 0 && i < skills.length) {
            probability = 0;
            break;
        }

        const effectiveProb = skill.prob / currentPoolProbSum;
        probability *= effectiveProb;
        sumOfProbsOfDrawnSkills += skill.prob; // Add probability of the current skill to the sum of drawn
    }
    return probability;
}


/**
 * Generates all relevant skill groupings (Top 3, Bottom 2) with their probabilities.
 * This is the most computationally intensive part.
 * @returns {Array<Object>} Array of { top3Skills: [], bottom2Skills: [], probability: number }
 */
function generateSkillGroupingsWithProbabilities() {
    const results = [];
    const allSkillsAsObjects = skills; // The original array of skill objects

    // Step 1: Get all C(17, 5) combinations of 5 distinct skills
    const fiveSkillCombinations = getCombinations(allSkillsAsObjects, 5);

    fiveSkillCombinations.forEach(comboOf5Skills => {
        // Step 2: For each combination, get all C(5, 3) ways to pick 3 for the 'Top 3' slots
        const top3Combinations = getCombinations(comboOf5Skills, 3);

        top3Combinations.forEach(top3SkillsObjects => {
            const bottom2SkillsObjects = comboOf5Skills.filter(s => !top3SkillsObjects.includes(s));

            const top3SkillNames = top3SkillsObjects.map(s => s.name);
            const bottom2SkillNames = bottom2SkillsObjects.map(s => s.name);

            let totalGroupingProbability = 0;

            // Step 3: Enumerate all 3! * 2! ordered arrangements for this (Top 3, Bottom 2) partition
            // and sum their conditional probabilities.
            const top3Permutations = getPermutations(top3SkillNames);
            const bottom2Permutations = getPermutations(bottom2SkillNames);

            top3Permutations.forEach(p3 => {
                bottom2Permutations.forEach(p2 => {
                    const fullSequence = [...p3, ...p2];
                    totalGroupingProbability += calculateSequenceProbability(fullSequence);
                });
            });

            results.push({
                top3Skills: top3SkillNames, // Store as names for easier lookup/scoring
                bottom2Skills: bottom2SkillNames,
                probability: totalGroupingProbability
            });
        });
    });

    return results;
}

/**
 * Helper to get all permutations of an array.
 * @param {Array<string>} arr - Array of skill names.
 * @returns {Array<Array<string>>} All permutations.
 */
function getPermutations(arr) {
    const result = [];
    function permute(currentArr, remainingArr) {
        if (remainingArr.length === 0) {
            result.push(currentArr);
            return;
        }
        for (let i = 0; i < remainingArr.length; i++) {
            const nextItem = remainingArr[i];
            const newRemaining = [...remainingArr.slice(0, i), ...remainingArr.slice(i + 1)];
            permute([...currentArr, nextItem], newRemaining);
        }
    }
    permute([], arr);
    return result;
}


let memoizedSkillGroupings = null;

function getOrCalculateSkillGroupings() {
    if (memoizedSkillGroupings) {
        return memoizedSkillGroupings;
    }

    const start = performance.now();
    console.log("Generating all skill groupings and their probabilities... This will take a moment.");
    memoizedSkillGroupings = generateSkillGroupingsWithProbabilities();
    const end = performance.now();
    console.log(`Finished generating ${memoizedSkillGroupings.length} skill groupings in ${end - start} ms.`);
    return memoizedSkillGroupings;
}

/**
 * Precomputes the distribution of all possible Pokemon scores and their probabilities.
 * This function is computationally intensive and should be run only when the scoring configuration changes.
 */
async function precomputeScoreDistribution() {
    console.log("Precomputing score distribution...");
    const scoreToProbabilityMap = new Map();
    let calculatedMaxScore = 0;

    const allSkillGroupings = getOrCalculateSkillGroupings();

    const batchSize = 1000;
    let processedCount = 0;

    try {
        const ingredientProbability = new Map();
        for (const ingredient of ingredients) {
            let score = scoringConfig.ingredientScores[ingredient.name] || 0;
            let probability = ingredient.probability + (ingredientProbability.get(score) || 0);
            ingredientProbability.set(score, probability);

        }

        const natureProbability = new Map();
        for (const nature of natures) {
            let score = 0;

            // Nature score based on boost/reduction categories
            const boostEffect = parseNatureEffect(nature.boost);
            const reductionEffect = parseNatureEffect(nature.reduction);

            if (boostEffect.category) {
                score += scoringConfig.natureBoostScores[boostEffect.category] || 0;
            }
            if (reductionEffect.category) {
                // Reduction scores are applied directly from the configured reduction score
                // If the user inputs a negative value for reduction, it will reduce the score.
                score += scoringConfig.natureReductionScores[reductionEffect.category] || 0;
            }

            let probability = nature.probability + (natureProbability.get(score) || 0);
            natureProbability.set(score, probability);
        }

        const skillProbability = new Map();
        for (const skillGroup of allSkillGroupings) {
            let score = 0;

            // Skill scores (first 3 slots directly, then conditionals)
            const skillsInTop3 = skillGroup.top3Skills; // Get skills in the first 3 slots

            const perSkillScore = new Map();

            skillsInTop3.forEach(skillName => {
                perSkillScore.set(skillName, scoringConfig.skillScores[skillName] || 0);
            });

            // Conditional skill scores (apply if the target skill is among the 5 skills)
            scoringConfig.conditionalSkillScores.forEach(rule => {
                const conditionMet = skillsInTop3.includes(rule.condition.skillName); // Check condition against all 5 skills
                // Apply conditional score only if the target skill is among the 5 skills
                if (skillsInTop3.includes(rule.targetSkill)) {
                    let baseScore = perSkillScore.get(rule.targetSkill) || 0;
                    if (conditionMet) {
                        baseScore += rule.scoreIfTrue;
                    } else {
                        baseScore += rule.scoreIfFalse;
                    }
                    perSkillScore.set(rule.targetSkill, baseScore);
                }
            });

            for (const sameSkillGroup of scoringConfig.sameSkillGroups) {
                let highestScore = 0;
                for (const skill of sameSkillGroup) {
                    let thisScore = perSkillScore.get(skill) || 0;
                    if (thisScore > highestScore) {
                        highestScore = thisScore;
                    }
                    perSkillScore.set(skill, 0);
                }
                score += highestScore;
            }

            for (const [skill, skillScore] of perSkillScore) {
                score += skillScore;
            }

            let probability = skillGroup.probability + (skillProbability.get(score) || 0);
            skillProbability.set(score, probability);
        }


        for (const [ing_score, ing_probability] of ingredientProbability) {
            for (const [nat_score, nat_probability] of natureProbability) {
                for (const [skill_score, skill_probability] of skillProbability) {

                    console.log("Nature:", nat_score, nat_probability);
                    console.log("Skill:", skill_score, skill_probability);
                    let score = ing_score + nat_score + skill_score;
                    let probability = ing_probability * nat_probability * skill_probability;

                    // Aggregate probabilities for the same score
                    scoreToProbabilityMap.set(
                        score,
                        (scoreToProbabilityMap.get(score) || 0) + probability
                    );

                    if (score > calculatedMaxScore) {
                        calculatedMaxScore = score;
                    }

                    processedCount++;
                    if (processedCount % batchSize === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }
            }
        }

        for (const [score, probability] of ingredientProbability) {
            console.log("Ingredient:", score, probability);
        }
        for (const [score, probability] of natureProbability) {
            console.log("Nature:", score, probability);
        }
        for (const [score, probability] of skillProbability) {
            console.log("Skill:", score, probability);
        }


        memoizedScoreDistribution = Array.from(scoreToProbabilityMap.entries())
            .map(([score, probability]) => ({ score, probability }))
            .sort((a, b) => a.score - b.score);

        currentMaxScore = calculatedMaxScore;
        console.log("Score distribution precomputation complete. Max Score:", currentMaxScore);
    } catch (error) {
        console.error("Error during precomputation of score distribution:", error);
        showModal("An error occurred during score distribution precomputation. Please check the console for details.");
    }
}


/**
 * Calculates the total probability of encountering a Pokemon with a score >= C,
 * using the pre-computed score distribution.
 * @param {number} targetScoreC - The minimum score.
 * @returns {number} The probability P_target (of one encounter being >= C).
 */
async function calculateP_target(targetScoreC) {
    // Ensure the distribution is computed before attempting to use it
    if (memoizedScoreDistribution.length === 0) {
        // This should ideally not happen if precompute is called on config changes,
        // but acts as a safeguard.
        await precomputeScoreDistribution();
    }

    let totalProbabilityAboveC = 0;
    // Iterate through the pre-computed and sorted scores
    for (const entry of memoizedScoreDistribution) {
        if (entry.score >= targetScoreC) {
            totalProbabilityAboveC += entry.probability;
        }
    }
    return totalProbabilityAboveC;
}

// Function to handle the main calculation based on fixed variables
async function handleCalculate() {
    // updateScoringConfigFromUI() is called on input changes, which triggers precomputeScoreDistribution.
    // So, no need to call it here.

    const varToCompute = document.querySelector('input[name="compute-var"]:checked').value;
    let P, X, C;
    let p_target;
    const resultText = document.getElementById('result-text');
    resultText.textContent = "Calculating...";

    try {
        // Use the pre-calculated maxScore for binary search range
        // Ensure precomputation has run at least once for currentMaxScore to be accurate
        if (memoizedScoreDistribution.length === 0) {
            await precomputeScoreDistribution();
        }
        const maxScoreForCalculation = currentMaxScore;

        if (varToCompute === 'C') {
            P = parseFloat(document.getElementById('prob-p-input').value) / 100;
            X = parseInt(document.getElementById('encounters-x-input').value);

            if (isNaN(P) || isNaN(X) || P < 0 || P > 1 || X < 1) {
                resultText.textContent = "Please enter valid P (0-100%) and X (>=1).";
                return;
            }

            // Calculate p_target from P and X
            if (P === 1) {
                p_target = (X === 1) ? 1 : 0; // If P=1 (100%), and X=1, then p_target must be 1. If X>1, and P=1, it means we definitely find one. This is a bit ambiguous for discrete C.
            } else if (P < 1 && X > 0) {
                p_target = 1 - Math.pow((1 - P), 1 / X);
            } else {
                resultText.textContent = "Invalid P or X for calculation.";
                return;
            }

            // Binary search for C
            let lowC = 0;
            let highC = maxScoreForCalculation || 1000; // Use currentMaxScore
            let bestC = lowC; // Initialize with a low value
            let iterations = 0;
            const maxIterations = 100; // Max iterations for binary search
            const tolerance = 0.0001; // Tolerance for p_target difference

            while (iterations < maxIterations && (highC - lowC) > tolerance) {
                const midC = (lowC + highC) / 2;
                const calculated_p_target = await calculateP_target(midC); // Optimized call

                if (Math.abs(calculated_p_target - p_target) < tolerance) {
                    bestC = midC;
                    break;
                } else if (calculated_p_target > p_target) { // If calculated p_target is too high, need a higher C
                    lowC = midC;
                } else { // If calculated p_target is too low, need a lower C
                    highC = midC;
                }
                bestC = midC; // Store the current midC as the best estimate
                iterations++;
            }
            resultText.textContent = `Minimum Score (C) is approximately: ${bestC.toFixed(2)}`;

        } else if (varToCompute === 'X') {
            P = parseFloat(document.getElementById('prob-p-input').value) / 100;
            C = parseFloat(document.getElementById('min-score-c-input').value);

            if (isNaN(P) || isNaN(C) || P < 0 || P > 1 || C < 0) {
                resultText.textContent = "Please enter valid P (0-100%) and Min Score (C >=0).";
                return;
            }

            p_target = await calculateP_target(C); // Optimized call

            if (p_target === 0) {
                resultText.textContent = `Probability of finding a Pokemon with score >= ${C.toFixed(2)} is 0. X would be infinite to reach ${P * 100}%.`;
            } else if (p_target >= 1) { // If p_target is 1 (or very close), it means any encounter will work
                if (P >= 1) { // If target P is also 100%
                    resultText.textContent = `Encounters (X) needed: 1 (as probability of finding score >= ${C.toFixed(2)} is 100%)`;
                } else { // If target P is less than 100%, but p_target is 100%
                    resultText.textContent = `Probability of finding a Pokemon with score >= ${C.toFixed(2)} is 100%. X would be 1 for any P.`;
                }
            } else { // p_target is > 0 and < 1
                X = Math.log(1 - P) / Math.log(1 - p_target);
                resultText.textContent = `Encounters (X) needed: ${Math.ceil(X)} (${X.toFixed(2)} exact)`;
            }

        } else if (varToCompute === 'P') {
            X = parseInt(document.getElementById('encounters-x-input').value);
            C = parseFloat(document.getElementById('min-score-c-input').value);

            if (isNaN(X) || isNaN(C) || X < 1 || C < 0) {
                resultText.textContent = "Please enter valid X (>=1) and Min Score (C >=0).";
                return;
            }
            p_target = await calculateP_target(C); // Optimized call

            P = 1 - Math.pow((1 - p_target), X);
            resultText.textContent = `Probability (P) of encountering score >= ${C.toFixed(2)} in ${X} encounters: ${(P * 100).toFixed(2)}%`;
        }
    } catch (error) {
        console.error("Calculation error:", error);
        resultText.textContent = "An error occurred during calculation. Please check your inputs.";
    }
}

// --- 4. Graphing Logic ---
let myChart; // Chart.js instance

async function generateGraph() {
    // updateScoringConfigFromUI() is called on input changes, which triggers precomputeScoreDistribution.
    // So, no need to call it here.

    const fixedGraphVar = document.getElementById('fixed-graph-var').value;
    const xAxisVar = document.getElementById('x-axis-var').value;
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    let labels = [];
    let data = [];
    let title = "";
    let xAxisLabel = "";
    let yAxisLabel = "";

    const P_input = parseFloat(document.getElementById('prob-p-input').value) / 100;
    const X_input = parseInt(document.getElementById('encounters-x-input').value);
    const C_input = parseFloat(document.getElementById('min-score-c-input').value);

    // Ensure precomputation has run at least once for currentMaxScore to be accurate
    if (memoizedScoreDistribution.length === 0) {
        await precomputeScoreDistribution();
    }
    const maxScoreForGraph = currentMaxScore; // Use the pre-calculated max score for graph range

    const numPoints = 20; // Number of points on the graph for performance

    try {
        if (fixedGraphVar === 'C' && xAxisVar === 'X') {
            // Fix C, plot P vs X
            title = `Probability (P) vs Encounters (X) for C = ${C_input.toFixed(0)}`;
            xAxisLabel = "Encounters (X)";
            yAxisLabel = "Probability (P) %";

            const p_target_val = await calculateP_target(C_input); // Optimized call

            const max_X = 100; // Max encounters for graph, adjust as needed
            for (let i = 0; i <= numPoints; i++) {
                const x = Math.ceil((i / numPoints) * max_X);
                if (x === 0) continue; // X must be at least 1
                labels.push(x);
                const P_val = 1 - Math.pow((1 - p_target_val), x);
                data.push((P_val * 100).toFixed(2));
            }

        } else if (fixedGraphVar === 'X' && xAxisVar === 'C') {
            // Fix X, plot P vs C
            title = `Probability (P) vs Min Score (C) for X = ${X_input}`;
            xAxisLabel = "Minimum Score (C)";
            yAxisLabel = "Probability (P) %";

            const min_C = 0;
            // Adjust max_C to be a bit higher than calculated maxScore, or a fixed reasonable value
            const graphMaxC = maxScoreForGraph > 0 ? maxScoreForGraph * 1.1 : 500; // Extend range slightly or default
            const step_C = Math.max(1, Math.floor(graphMaxC / numPoints)); // Dynamic step based on maxScore

            for (let i = 0; i <= numPoints; i++) {
                const c = min_C + Math.floor((i / numPoints) * graphMaxC);
                labels.push(c.toFixed(0));
                const p_target_val = await calculateP_target(c); // Optimized call
                const P_val = 1 - Math.pow((1 - p_target_val), X_input);
                data.push((P_val * 100).toFixed(2));
            }

        } else if (fixedGraphVar === 'P' && xAxisVar === 'X') {
            // Fix P, plot C vs X (hard to compute C iteratively for each X)
            title = `Minimum Score (C) vs Encounters (X) for P = ${P_input * 100}%`;
            xAxisLabel = "Encounters (X)";
            yAxisLabel = "Minimum Score (C)";

            const max_X = 100; // Max encounters for graph, adjust as needed
            for (let i = 0; i <= numPoints; i++) {
                const x = Math.ceil((i / numPoints) * max_X);
                if (x === 0) continue; // X must be at least 1
                labels.push(x);

                const target_p_target_for_X_P = 1 - Math.pow((1 - P_input), 1 / x);
                if (isNaN(target_p_target_for_X_P) || target_p_target_for_X_P <= 0 || target_p_target_for_X_P >= 1) {
                    data.push(NaN); // Cannot compute meaningful C
                    continue;
                }

                // Binary search for C for each X
                let lowC = 0;
                const graphMaxC = maxScoreForGraph > 0 ? maxScoreForGraph * 1.1 : 500; // Use actual max score
                let highC = graphMaxC;
                let bestC = lowC;
                const tolerance = 0.0001;
                const maxIterations = 50; // Limit iterations per point

                let iterations = 0;
                while (iterations < maxIterations && (highC - lowC) > tolerance) {
                    const midC = (lowC + highC) / 2;
                    const calculated_p_target = await calculateP_target(midC); // Optimized call

                    if (Math.abs(calculated_p_target - target_p_target_for_X_P) < tolerance) {
                        bestC = midC;
                        break;
                    } else if (calculated_p_target > target_p_target_for_X_P) {
                        lowC = midC;
                    } else {
                        highC = midC;
                    }
                    bestC = midC;
                    iterations++;
                }
                data.push(bestC.toFixed(2));
            }

        } else if (fixedGraphVar === 'P' && xAxisVar === 'C') { // New Case for P (fixed) vs C (x-axis) -- this is the same as fixed X, plot P vs C, but fixed var is P.
            title = `Encounters (X) vs Min Score (C) for P = ${P_input * 100}%`;
            xAxisLabel = "Minimum Score (C)";
            yAxisLabel = "Encounters (X)";

            const min_C = 0;
            const graphMaxC = maxScoreForGraph > 0 ? maxScoreForGraph * 1.1 : 500;
            const step_C = Math.max(1, Math.floor(graphMaxC / numPoints));

            for (let i = 0; i <= numPoints; i++) {
                const c = min_C + Math.floor((i / numPoints) * graphMaxC);
                labels.push(c.toFixed(0));
                const p_target_val = await calculateP_target(c);

                if (p_target_val === 0) {
                    data.push(NaN); // X would be infinite
                } else if (p_target_val >= 1) {
                    data.push(1); // X would be 1
                } else {
                    const X_val = Math.log(1 - P_input) / Math.log(1 - p_target_val);
                    data.push(Math.ceil(X_val));
                }
            }

        } else if (fixedGraphVar === 'X' && xAxisVar === 'P') { // New Case for X (fixed) vs P (x-axis) -- this is the same as fixed P, plot C vs X, but fixed var is X.
            title = `Minimum Score (C) vs Probability (P) for X = ${X_input}`;
            xAxisLabel = "Probability (P) %";
            yAxisLabel = "Minimum Score (C)";

            const min_P = 0;
            const max_P = 100;
            for (let i = 0; i <= numPoints; i++) {
                const p = (i / numPoints); // P from 0 to 1
                labels.push((p * 100).toFixed(0));

                if (p === 0) { // If P is 0%, C can be anything
                    data.push(0); // Arbitrarily set to 0, or NaN for "not applicable"
                    continue;
                }
                if (p === 1) { // If P is 100%
                    const calculated_p_target_at_1 = await calculateP_target(0); // Probability of any Pokemon
                    if (calculated_p_target_at_1 >= 1) { // If there's a 100% chance to find any Pokemon
                        data.push(0); // If C is 0, then X=1 is enough to get 100% P.
                    } else {
                        data.push(NaN); // Cannot guarantee 100% P if p_target is less than 1
                    }
                    continue;
                }

                const target_p_target_for_X_P = 1 - Math.pow((1 - p), 1 / X_input);
                if (isNaN(target_p_target_for_X_P) || target_p_target_for_X_P <= 0 || target_p_target_for_X_P >= 1) {
                    data.push(NaN);
                    continue;
                }

                let lowC = 0;
                const graphMaxC = maxScoreForGraph > 0 ? maxScoreForGraph * 1.1 : 500;
                let highC = graphMaxC;
                let bestC = lowC;
                const tolerance = 0.0001;
                const maxIterations = 50;

                let iterations = 0;
                while (iterations < maxIterations && (highC - lowC) > tolerance) {
                    const midC = (lowC + highC) / 2;
                    const calculated_p_target = await calculateP_target(midC);

                    if (Math.abs(calculated_p_target - target_p_target_for_X_P) < tolerance) {
                        bestC = midC;
                        break;
                    } else if (calculated_p_target > target_p_target_for_X_P) {
                        lowC = midC;
                    } else {
                        highC = midC;
                    }
                    bestC = midC;
                    iterations++;
                }
                data.push(bestC.toFixed(2));
            }

        } else if (fixedGraphVar === 'P' && xAxisVar === 'C') { // This case is already covered by the previous logic
            // (P vs C is essentially the same as P fixed, plot X vs C)
        } else {
            showModal("Selected graphing combination is not supported. Please choose from (C vs X), (P vs C), (P vs X), (X vs C), (X vs P).");
            return;
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: yAxisLabel,
                    data: data,
                    borderColor: var_to_css_color('--primary-color'),
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 3 // Make points visible
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        color: var_to_css_color('--text-color')
                    },
                    legend: {
                        labels: {
                            color: var_to_css_color('--text-color')
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xAxisLabel,
                            color: var_to_css_color('--text-color')
                        },
                        ticks: {
                            color: var_to_css_color('--text-color')
                        },
                        grid: {
                            color: var_to_css_color('--border-color')
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: yAxisLabel,
                            color: var_to_css_color('--text-color')
                        },
                        ticks: {
                            color: var_to_css_color('--text-color')
                        },
                        grid: {
                            color: var_to_css_color('--border-color')
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Graph generation error:", error);
        showModal("An error occurred during graph generation. Please check the console for details.");
    }
}

// Helper to get CSS variable value for Chart.js
function var_to_css_color(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// --- Custom Modal for Alerts (replacing window.alert) ---
function showModal(message) {
    const modalId = 'custom-alert-modal';
    const overlayId = 'custom-alert-modal-overlay'; // New overlay ID
    let modal = document.getElementById(modalId);
    let overlay = document.getElementById(overlayId);

    // Create overlay if it doesn't exist
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7); /* Semi-transparent black */
            z-index: 999; /* Below the modal, above everything else */
            display: none; /* Hidden by default */
        `;
        document.body.appendChild(overlay);
    }

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--input-bg); /* Use a defined variable */
            color: var(--text-color);
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            max-width: 90%;
            min-width: 250px; /* Give it a minimum width */
            text-align: center;
        `;
        document.body.appendChild(modal);

        const messageElement = document.createElement('p');
        modal.appendChild(messageElement); // Add message element once

        const modalButton = document.createElement('button');
        modalButton.textContent = 'OK';
        modalButton.style.cssText = `
            background-color: var(--primary-color);
            color: white;
            padding: 8px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s ease;
        `;
        modalButton.onmouseover = () => modalButton.style.backgroundColor = 'var(--button-hover)';
        modalButton.onmouseout = () => modalButton.style.backgroundColor = 'var(--primary-color)';
        modalButton.onclick = () => {
            modal.style.display = 'none';
            overlay.style.display = 'none'; // Hide overlay when modal is hidden
        };
        modal.appendChild(modalButton);
    }

    // Update message and show modal/overlay
    modal.querySelector('p').textContent = message;
    modal.style.display = 'flex';
    overlay.style.display = 'block'; // Show overlay
}