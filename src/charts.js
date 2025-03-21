// Utility function to create SVG elements
function createSVGElement(tag, attrs = {}) {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => elem.setAttribute(key, value));
    return elem;
}

export function renderXpProgressChart(transactions, container) {
    container.innerHTML = ""; // Clear existing content

    if (transactions.length === 0) return;

    // Sort by date ascending
    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Build cumulative points
    let cumulativeXP = 0;
    const points = transactions.map((entry) => {
        cumulativeXP += entry.amount;
        return { date: new Date(entry.createdAt), xp: cumulativeXP };
    });

    const width = container.clientWidth || 600;
    const height = 400;
    const padding = 50;

    const minDate = points[0].date;
    const maxDate = points[points.length - 1].date;
    const maxXP = Math.max(...points.map((p) => p.xp));

    // Scale helpers
    const xScale = (date) =>
        padding + ((date - minDate) / (maxDate - minDate)) * (width - 2 * padding);
    const yScale = (xp) =>
        height - padding - (xp / maxXP) * (height - 2 * padding);

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.background = "#f9fafb";

    // Draw axes
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("stroke", "#cbd5e1");
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", height - padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", padding);
    yAxis.setAttribute("stroke", "#cbd5e1");
    svg.appendChild(yAxis);

    // Draw line path
    let pathData = `M ${xScale(points[0].date)} ${yScale(points[0].xp)}`;
    points.forEach((point) => {
        pathData += ` L ${xScale(point.date)} ${yScale(point.xp)}`;
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "#6366f1");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // Tooltip element
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.background = "#6366f1";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "13px";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    tooltip.style.transform = "translate(-50%, -150%)";
    container.appendChild(tooltip);

    // Add hoverable circles for each point
    points.forEach((point) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", xScale(point.date));
        circle.setAttribute("cy", yScale(point.xp));
        circle.setAttribute("r", 5);
        circle.setAttribute("fill", "#4f46e5");
        circle.style.cursor = "pointer";

        circle.addEventListener("mouseenter", (event) => {
            tooltip.style.display = "block";
            tooltip.textContent = `XP: ${point.xp} on ${point.date.toDateString()}`;
        });

        circle.addEventListener("mousemove", (event) => {
            tooltip.style.left = `${event.pageX}px`;
            tooltip.style.top = `${event.pageY}px`;
        });

        circle.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        svg.appendChild(circle);
    });

    container.appendChild(svg);
}

export function renderPassFailPieChart(results, container) {
    container.innerHTML = ""; // Clear old chart

    const passCount = results.filter((r) => r.grade === 1).length;
    const failCount = results.filter((r) => r.grade === 0).length;
    const total = passCount + failCount;

    if (total === 0) {
        container.innerHTML = "<p>No data available to display chart.</p>";
        return;
    }

    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const svgSize = 300;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgSize);
    svg.setAttribute("height", svgSize);
    svg.style.background = "#f9fafb";

    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.background = "#4b5563";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "13px";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    tooltip.style.transform = "translate(-50%, -150%)";
    container.appendChild(tooltip);

    const slices = [
        { count: passCount, color: "#4ade80", label: "Pass" },
        { count: failCount, color: "#ef4444", label: "Fail" },
    ];

    let startAngle = 0;
    slices.forEach((slice) => {
        const sliceAngle = (slice.count / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

        const pathData = `
            M ${centerX} ${centerY}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData.trim());
        path.setAttribute("fill", slice.color);
        path.style.cursor = "pointer";

        path.addEventListener("mouseenter", () => {
            tooltip.style.display = "block";
            tooltip.textContent = `${slice.label}: ${slice.count}`;
        });

        path.addEventListener("mousemove", (event) => {
            tooltip.style.left = `${event.pageX}px`;
            tooltip.style.top = `${event.pageY}px`;
        });

        path.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        svg.appendChild(path);
        startAngle = endAngle;
    });

    container.appendChild(svg);
}

// // Function to describe an arc path for pie chart slices
// function describeArc(x, y, radius, startAngle, endAngle) {
//     const start = polarToCartesian(x, y, radius, endAngle);
//     const end = polarToCartesian(x, y, radius, startAngle);

//     const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

//     return [
//         "M", start.x, start.y,
//         "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
//         "L", x, y,
//         "Z"
//     ].join(" ");
// }

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
