// Utility function to create SVG elements
function createSVGElement(tag, attrs = {}) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => elem.setAttribute(key, value));
    return elem;
}

export function renderXpBarChart(transactions, container) {
    container.innerHTML = ''; // Clear previous chart

    // Group XP by project name
    const projectData = {};
    transactions.forEach(tx => {
        const projectName = tx.object?.name || `ID ${tx.objectId}`;
        if (!projectData[projectName]) {
            projectData[projectName] = 0;
        }
        projectData[projectName] += tx.amount;
    });

    const projects = Object.keys(projectData);
    const maxXp = Math.max(...Object.values(projectData));

    const svg = createSVGElement('svg', { width: 500, height: 300 });

    projects.forEach((project, index) => {
        const barHeight = (projectData[project] / maxXp) * 250;
        const bar = createSVGElement('rect', {
            x: index * 50 + 20,
            y: 300 - barHeight,
            width: 30,
            height: barHeight,
            fill: '#6366f1'
        });

        // Animate bar growth
        bar.style.transition = 'height 0.7s ease-out';

        svg.appendChild(bar);

        // Add project labels
        const label = createSVGElement('text', {
            x: index * 50 + 35,
            y: 295,
            'font-size': '10px',
            'text-anchor': 'middle',
            fill: '#c7d2fe'
        });
        label.textContent = project.slice(0, 4); // Short label
        svg.appendChild(label);
    });

    container.appendChild(svg);
}

export function renderPassFailPieChart(results, container) {
    container.innerHTML = ''; // Clear old chart

    const passCount = results.filter(r => r.grade === 1).length;
    const failCount = results.filter(r => r.grade === 0).length;
    const total = passCount + failCount;

    const svg = createSVGElement('svg', { width: 200, height: 200 });
    const centerX = 100, centerY = 100, radius = 80;

    const passAngle = (passCount / total) * 2 * Math.PI;
    const failAngle = (failCount / total) * 2 * Math.PI;

    const passX = centerX + radius * Math.cos(passAngle - Math.PI / 2);
    const passY = centerY + radius * Math.sin(passAngle - Math.PI / 2);

    // Pass slice
    const passPath = createSVGElement('path', {
        d: describeArc(centerX, centerY, radius, -90, (passCount / total) * 360 - 90),
        fill: '#4ade80'
    });

    // Fail slice
    const failPath = createSVGElement('path', {
        d: describeArc(centerX, centerY, radius, (passCount / total) * 360 - 90, 270),
        fill: '#ef4444'
    });

    svg.appendChild(passPath);
    svg.appendChild(failPath);

    container.appendChild(svg);
}

// Function to describe an arc path for pie chart slices
function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", x, y,
        "Z"
    ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
