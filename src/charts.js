import { formatXP } from "./profileManager.js";

function renderXpProgressChart(transactions, container) {
    container.innerHTML = "";

    const moduleStartDate = new Date(2024, 3, 1); // April 1st, 2024
    const filteredTransactions = transactions.filter(
        (tx) => new Date(tx.createdAt) >= moduleStartDate
    );

    if (filteredTransactions.length === 0) {
        container.innerHTML = "<p>No data to display for the core module period.</p>";
        return;
    }

    filteredTransactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let cumulativeXP = 0;
    const points = filteredTransactions.map((tx) => {
        cumulativeXP += tx.amount;
        return { date: new Date(tx.createdAt), xp: cumulativeXP };
    });

    const width = container.clientWidth;
    const designedHeight = 500; // Original designed height, used for viewBox aspect ratio
    // Make padding responsive: 10% of width, capped between 30 and 60px.
    const dynamicPadding = Math.max(30, Math.min(width * 0.1, 60));

    const minDate = points[0].date;
    const maxDate = points[points.length - 1].date;
    const maxXP = Math.max(...points.map((p) => p.xp), 0); // Ensure maxXP is not -Infinity if points is empty, though filteredTransactions check helps

    // Check for division by zero if minDate equals maxDate
    const dateRange = (maxDate - minDate);
    const xScale = (date) =>
        dynamicPadding + (dateRange > 0 ? ((date - minDate) / dateRange) * (width - 2 * dynamicPadding) : (width - 2 * dynamicPadding) / 2);
    
    // Check for division by zero if maxXP is 0
    const yScale = (xp) =>
        designedHeight - dynamicPadding - (maxXP > 0 ? (xp / maxXP) * (designedHeight - 2 * dynamicPadding) : 0);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${designedHeight}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "auto");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.background = "#ffffff";
    svg.style.display = "block"; // Good practice for SVG responsiveness

    // Horizontal grid lines & Y-axis labels
    const gridLineCount = 5;
    for (let i = 0; i <= gridLineCount; i++) {
        const y = dynamicPadding + ((designedHeight - 2 * dynamicPadding) / gridLineCount) * i;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", dynamicPadding);
        line.setAttribute("x2", width - dynamicPadding);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#e2e8f0");
        svg.appendChild(line);

        const value = maxXP > 0 ? maxXP - (maxXP / gridLineCount) * i : 0;
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", dynamicPadding - 10);
        label.setAttribute("y", y + 5); // Small offset for vertical alignment
        label.setAttribute("text-anchor", "end");
        label.setAttribute("fill", "#64748b");
        label.style.fontSize = width < 400 ? "10px" : "12px"; // Responsive font size
        label.textContent = formatXP(Math.round(value));
        svg.appendChild(label);
    }

    // Month ticks starting from April 2024
    const monthTicks = [];
    if (points.length > 0) { // Ensure there are points to derive dates from
        const currentTickDate = new Date(minDate);
        currentTickDate.setDate(1); // Start ticks from the beginning of the month
        while (currentTickDate <= maxDate) {
            monthTicks.push(new Date(currentTickDate));
            currentTickDate.setMonth(currentTickDate.getMonth() + 1);
        }
        // Ensure the last month is included if it's not already a tick
        if (monthTicks.length === 0 || monthTicks[monthTicks.length -1].getTime() < maxDate.getTime()){ 
            const lastMonthTick = new Date(maxDate);
            lastMonthTick.setDate(1);
            if(!monthTicks.find(tick => tick.getTime() === lastMonthTick.getTime())){
                 // Add if not already there and if it's different from the last one to avoid duplicates if maxDate is early in month
                if(monthTicks.length === 0 || monthTicks[monthTicks.length-1].getMonth() !== lastMonthTick.getMonth() || monthTicks[monthTicks.length-1].getFullYear() !== lastMonthTick.getFullYear()) {
                    monthTicks.push(lastMonthTick);
                }
            }
        }
    }
    
    // labelScale function (defined inside or ensure monthTicks is accessible)
    const labelScale = (date, index, ticks) => {
        if (!ticks || ticks.length === 0) return dynamicPadding; // Fallback
        const firstTickX = xScale(ticks[0]);
        // Ensure last tick is not beyond the chart width
        const lastTickX = Math.min(xScale(ticks[ticks.length - 1]), width - dynamicPadding);
        const availableWidthForLabels = lastTickX - firstTickX;
        
        if (ticks.length <= 1) return firstTickX + availableWidthForLabels / 2; // Center if one tick
        
        const spacing = availableWidthForLabels / (ticks.length - 1);
        let calculatedX = firstTickX + spacing * index;
        
        // Adjust first and last label to be fully visible
        if (index === 0) calculatedX = Math.max(calculatedX, dynamicPadding); // Ensure not cut off left
        if (index === ticks.length - 1) calculatedX = Math.min(calculatedX, width - dynamicPadding); // Ensure not cut off right
        return calculatedX;
    };

    monthTicks.forEach((date, index) => {
        const x = xScale(date);
        const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        vLine.setAttribute("x1", x);
        vLine.setAttribute("x2", x);
        vLine.setAttribute("y1", dynamicPadding);
        vLine.setAttribute("y2", designedHeight - dynamicPadding);
        vLine.setAttribute("stroke", "#f1f5f9");
        svg.appendChild(vLine);

        const textX = labelScale(date, index, monthTicks);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", designedHeight - dynamicPadding + 20); // Position below x-axis
        text.setAttribute("text-anchor", "middle");
        // Rotate labels if too many to fit or width is too small
        if (monthTicks.length > 5 && width < 600) {
            text.setAttribute("transform", `rotate(-45 ${textX} ${designedHeight - dynamicPadding + 20})`);
            text.setAttribute("text-anchor", "end");
            text.setAttribute("y", designedHeight - dynamicPadding + 10); // Adjust y for rotation
        } else {
            text.setAttribute("text-anchor", "middle");
        }
        text.setAttribute("fill", "#64748b");
        text.style.fontSize = width < 400 ? "9px" : "11px"; // Responsive font size for x-axis labels
        text.textContent = `${date.toLocaleString("default", { month: "short" })} '${String(date.getFullYear()).slice(2)}`;
        svg.appendChild(text);
    });

    // Axes
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", dynamicPadding);
    xAxis.setAttribute("y1", designedHeight - dynamicPadding);
    xAxis.setAttribute("x2", width - dynamicPadding);
    xAxis.setAttribute("y2", designedHeight - dynamicPadding);
    xAxis.setAttribute("stroke", "#94a3b8");
    xAxis.setAttribute("stroke-width", "2");
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", dynamicPadding);
    yAxis.setAttribute("y1", dynamicPadding);
    yAxis.setAttribute("x2", dynamicPadding);
    yAxis.setAttribute("y2", designedHeight - dynamicPadding);
    yAxis.setAttribute("stroke", "#94a3b8");
    yAxis.setAttribute("stroke-width", "2");
    svg.appendChild(yAxis);

    // Smooth cubic Bézier path
    if (points.length > 0) {
        let pathData = `M ${xScale(points[0].date)} ${yScale(points[0].xp)}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cp1x = xScale(prev.date) + (xScale(curr.date) - xScale(prev.date)) / 3;
            const cp1y = yScale(prev.xp);
            const cp2x = xScale(curr.date) - (xScale(curr.date) - xScale(prev.date)) / 3;
            const cp2y = yScale(curr.xp);
            pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xScale(curr.date)} ${yScale(curr.xp)}`;
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", "#6366f1");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("fill", "none");
        svg.appendChild(path);

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
        tooltip.style.transform = "translate(-50%, -120%)"; // Adjust as needed
        tooltip.style.zIndex = "10"; // Ensure tooltip is above chart elements
        container.style.position = "relative"; // Needed for absolute positioning of tooltip
        container.appendChild(tooltip);

        let lastX = -Infinity;
        const minXSpacing = 12; // Minimum pixel spacing for data point circles

        points.forEach((point) => {
            const x = xScale(point.date);
            if (x - lastX < minXSpacing && x !== xScale(points[0].date) && x !== xScale(points[points.length-1].date) ) return; // Avoid clutter, but always show first/last
            lastX = x;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", yScale(point.xp));
            circle.setAttribute("r", width < 400 ? "3" : "4"); // Smaller radius for smaller screens
            circle.setAttribute("fill", "#6366f1");
            circle.style.cursor = "pointer";

            circle.addEventListener("mouseenter", (event) => {
                tooltip.style.display = "block";
                tooltip.textContent = `XP: ${formatXP(Math.round(point.xp))} on ${point.date.toLocaleDateString()}`;
                // Position tooltip relative to the container, not just SVG offset for consistency
                const containerRect = container.getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect(); // Get SVG's position relative to viewport
                tooltip.style.left = `${event.clientX - containerRect.left}px`;
                tooltip.style.top = `${event.clientY - containerRect.top - 30}px`; // Offset tooltip above cursor
            });

            circle.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });
            svg.appendChild(circle);
        });
    }
    container.appendChild(svg);

    // Add a resize listener to re-render the chart
    // Debounce function to limit how often render function is called during resize
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    const debouncedRender = debounce(() => renderXpProgressChart(transactions, container), 250);
    
    // Check if a resize listener is already attached to avoid duplicates if this function is called multiple times
    if (!container.hasAttribute('data-resize-listener-attached')) {
        window.addEventListener('resize', debouncedRender);
        container.setAttribute('data-resize-listener-attached', 'true');
    }
}

function renderAuditRatioBarChart(user, container) {
    container.innerHTML = '';

    // Calculate XP received (transactions of type 'up')
    const xpGiven = user.transactions
        .filter(tx => tx.type === "up")
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate XP given (transactions of type 'down')
    const xpReceived = user.transactions
        .filter(tx => tx.type === "down")
        .reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate audit ratio
    const auditRatio = xpReceived > 0 ? (xpGiven / xpReceived).toFixed(1) : 'N/A';

    // Chart dimensions and layout
    const svgWidth = 1000;
    const svgHeight = 200;
    const barHeight = 30;
    const barSpacing = 70;
    const maxXP = Math.max(xpReceived, xpGiven);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', svgWidth);
    svg.setAttribute('height', svgHeight);

    const data = [
        { label: 'XP Received', value: xpReceived, color: '#3b82f6' },
        { label: 'XP Given', value: xpGiven, color: '#22c55e' }
    ];

    data.forEach((item, index) => {
        const barLength = (item.value / maxXP) * 300;
        const yOffset = index * barSpacing;

        // Static left-side label
        const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textLabel.setAttribute('x', 10);
        textLabel.setAttribute('y', yOffset + barHeight / 2 + 5);
        textLabel.setAttribute('fill', '#334155');
        textLabel.style.fontSize = '15px';
        textLabel.textContent = item.label;
        svg.appendChild(textLabel);

        // Bar itself
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 150);
        rect.setAttribute('y', yOffset);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('width', 0); // Animate from width 0
        rect.setAttribute('fill', item.color);
        svg.appendChild(rect);

        // Animate bar growth
        setTimeout(() => {
            rect.setAttribute('width', barLength);
        }, 100);

        // Value label at end of bar
        const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueLabel.setAttribute('x', 160 + barLength);
        valueLabel.setAttribute('y', yOffset + barHeight / 2 + 5);
        valueLabel.setAttribute('fill', '#475569');
        valueLabel.style.fontSize = '14px';
        valueLabel.textContent = formatXP(item.value);
        svg.appendChild(valueLabel);
    });

    container.appendChild(svg);

    // Display audit ratio summary below the chart
    const ratioText = document.createElement('div');
    ratioText.style.textAlign = 'center';
    ratioText.style.fontSize = '18px';
    ratioText.style.marginTop = '10px';
    ratioText.innerHTML = `<strong>Audit Ratio:</strong> ${auditRatio}`;
    container.appendChild(ratioText);
}

export { renderXpProgressChart, renderAuditRatioBarChart};
