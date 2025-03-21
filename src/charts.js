function renderXpProgressChart(transactions, container) {
    container.innerHTML = "";

    if (transactions.length === 0) {
        container.innerHTML = "<p>No data to display.</p>";
        return;
    }

    transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let cumulativeXP = 0;
    const points = transactions.map((tx) => {
        cumulativeXP += tx.amount;
        return { date: new Date(tx.createdAt), xp: cumulativeXP };
    });

    const width = container.clientWidth;
    const height = 500;
    const padding = 80;

    const minDate = points[0].date;
    const maxDate = points[points.length - 1].date;
    const maxXP = Math.max(...points.map((p) => p.xp));

    const xScale = (date) =>
        padding + ((date - minDate) / (maxDate - minDate)) * (width - 2 * padding);
    const yScale = (xp) =>
        height - padding - (xp / maxXP) * (height - 2 * padding);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.background = "#ffffff";

    // Draw horizontal grid lines
    const gridLineCount = 5;
    for (let i = 0; i <= gridLineCount; i++) {
        const y = padding + ((height - 2 * padding) / gridLineCount) * i;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding);
        line.setAttribute("x2", width - padding);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#e2e8f0");
        svg.appendChild(line);
    }

    // Draw vertical grid lines and month ticks
    const monthTicks = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (current <= maxDate) {
        monthTicks.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    monthTicks.forEach((date) => {
        const x = xScale(date);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("x2", x);
        line.setAttribute("y1", padding);
        line.setAttribute("y2", height - padding);
        line.setAttribute("stroke", "#f1f5f9");
        svg.appendChild(line);

        // Add month label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - padding + 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#64748b");
        text.style.fontSize = "12px";
        text.textContent = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        svg.appendChild(text);
    });

    // Axes
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("stroke", "#94a3b8");
    xAxis.setAttribute("stroke-width", "2");
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    yAxis.setAttribute("stroke", "#94a3b8");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    // Smooth cubic Bézier path
    let pathData = `M ${xScale(points[0].date)} ${yScale(points[0].xp)}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cx = (xScale(prev.date) + xScale(curr.date)) / 2;
        pathData += ` C ${cx} ${yScale(prev.xp)}, ${cx} ${yScale(curr.xp)}, ${xScale(curr.date)} ${yScale(curr.xp)}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "#6366f1");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // Animate line draw
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    path.style.transition = "stroke-dashoffset 2s ease-in-out";
    setTimeout(() => {
        path.style.strokeDashoffset = "0";
    }, 100);

    // Tooltip setup
    const tooltip = document.createElement("div");
    tooltip.style.position = "absolute";
    tooltip.style.background = "#4f46e5";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "5px 10px";
    tooltip.style.borderRadius = "6px";
    tooltip.style.fontSize = "12px";
    tooltip.style.display = "none";
    tooltip.style.pointerEvents = "none";
    tooltip.style.transform = "translate(-50%, -120%)";
    container.style.position = "relative";
    container.appendChild(tooltip);

    let lastX = -Infinity;
    points.forEach((point) => {
        const x = xScale(point.date);
        if (x - lastX < 12) return; // prevent overcrowding
        lastX = x;

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", yScale(point.xp));
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#6366f1");
        circle.style.cursor = "pointer";

        circle.addEventListener("mouseenter", () => {
            tooltip.style.display = "block";
            tooltip.textContent = `XP: ${point.xp} on ${point.date.toDateString()}`;
        });

        circle.addEventListener("mousemove", (event) => {
            tooltip.style.left = `${event.offsetX}px`;
            tooltip.style.top = `${event.offsetY}px`;
        });

        circle.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        svg.appendChild(circle);
    });

    container.appendChild(svg);
}

export { renderXpProgressChart };
