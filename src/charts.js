import { formatXP } from "./utils.js";

function renderXpProgressChart(transactions, container) {
    container.innerHTML = "";

    if (transactions.length === 0) {
        container.innerHTML = "<p>No data to display for this module.</p>";
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

    // Horizontal grid lines and Y-axis labels
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

        // Y-axis labels
        const value = maxXP - (maxXP / gridLineCount) * i;
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", padding - 10);
        label.setAttribute("y", y + 5);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("fill", "#64748b");
        label.style.fontSize = "12px";
        label.textContent = formatXP(Math.round(value));
        svg.appendChild(label);
    }

    // Month ticks
    const monthTicks = [];
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (current <= maxDate) {
        monthTicks.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    const labelScale = (date, index) => {
        const firstLabelX = xScale(monthTicks[0]) + 80;
        const lastLabelX = width - padding;
        const spacing = (lastLabelX - firstLabelX) / (monthTicks.length - 1);
        if (index === 0) return firstLabelX;
        if (index === monthTicks.length - 1) return lastLabelX;
        return firstLabelX + spacing * index;
    };

    monthTicks.forEach((date, index) => {
        const x = xScale(date);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("x2", x);
        line.setAttribute("y1", padding);
        line.setAttribute("y2", height - padding);
        line.setAttribute("stroke", "#f1f5f9");
        svg.appendChild(line);

        const labelX = labelScale(date, index);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", labelX);
        text.setAttribute("y", height - padding + 20);
        text.setAttribute("text-anchor", index === 0 ? "start" : index === monthTicks.length - 1 ? "end" : "middle");
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

    // XP progression curve
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

    points.forEach((point) => {
        const x = xScale(point.date);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", yScale(point.xp));
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#6366f1");
        circle.style.cursor = "pointer";

        circle.addEventListener("mouseenter", () => {
            tooltip.style.display = "block";
            tooltip.textContent = `XP: ${formatXP(point.xp)} on ${point.date.toDateString()}`;
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

function renderAuditRatioBarChart(user, container) {
    container.innerHTML = '';

    const xpReceived = user.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const xpGiven = user.auditRatio * xpReceived;

    if (xpReceived === 0 && xpGiven === 0) {
        container.innerHTML = '<p>No audit data to display.</p>';
        return;
    }

    const maxXP = Math.max(xpReceived, xpGiven);
    const chartData = [
        { label: 'XP Received', value: xpReceived, color: '#3b82f6' },
        { label: 'XP Given', value: xpGiven, color: '#22c55e' }
    ];

    const svgWidth = container.clientWidth;
    const barHeight = 40;
    const gap = 30;
    const svgHeight = chartData.length * (barHeight + gap) + 50;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);

    chartData.forEach((item, index) => {
        const barLength = (item.value / maxXP) * (svgWidth - 250);

        // Horizontal bar
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 200);
        rect.setAttribute('y', index * (barHeight + gap));
        rect.setAttribute('height', barHeight);
        rect.setAttribute('width', 0);
        rect.setAttribute('fill', item.color);
        svg.appendChild(rect);

        // Animate the bar
        setTimeout(() => {
            rect.setAttribute('width', barLength);
        }, 100);

        // Left-side labels
        const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textLabel.setAttribute('x', 0);
        textLabel.setAttribute('y', index * (barHeight + gap) + barHeight / 2 + 5);
        textLabel.setAttribute('fill', '#334155');
        textLabel.style.fontSize = '14px';
        textLabel.textContent = item.label;
        svg.appendChild(textLabel);

        // Right-side value labels
        const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueLabel.setAttribute('x', 210 + barLength);
        valueLabel.setAttribute('y', index * (barHeight + gap) + barHeight / 2 + 5);
        valueLabel.setAttribute('fill', '#475569');
        valueLabel.style.fontSize = '13px';
        valueLabel.textContent = `${formatXP(item.value)}`;
        svg.appendChild(valueLabel);
    });

    container.appendChild(svg);

    // Display audit ratio below the chart
    const ratio = xpReceived > 0 ? (xpGiven / xpReceived).toFixed(2) : 'N/A';
    const ratioText = document.createElement('p');
    ratioText.style.marginTop = '20px';
    ratioText.style.fontSize = '16px';
    ratioText.style.fontWeight = 'bold';
    ratioText.style.color = '#334155';
    ratioText.textContent = `Audit Ratio (XP Given / XP Received): ${ratio}`;
    container.appendChild(ratioText);
}

export { renderXpProgressChart, renderAuditRatioBarChart};
