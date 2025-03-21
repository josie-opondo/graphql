function renderXpProgressChart(transactions, container) {
    function drawChart() {
        container.innerHTML = "";

        if (transactions.length === 0) return;

        transactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        let cumulativeXP = 0;
        const points = transactions.map((entry) => {
            cumulativeXP += entry.amount;
            return { date: new Date(entry.createdAt), xp: cumulativeXP };
        });

        const width = container.clientWidth;
        const height = 500;
        const padding = 60;
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

        // Axes
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", padding);
        xAxis.setAttribute("y1", height - padding);
        xAxis.setAttribute("x2", width - padding);
        xAxis.setAttribute("y2", height - padding);
        xAxis.setAttribute("stroke", "#6366f1");
        xAxis.setAttribute("stroke-width", "2");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", padding);
        yAxis.setAttribute("y1", height - padding);
        yAxis.setAttribute("x2", padding);
        yAxis.setAttribute("y2", padding);
        yAxis.setAttribute("stroke", "#6366f1");
        yAxis.setAttribute("stroke-width", "2");
        svg.appendChild(yAxis);

        // Draw the XP progression line
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

        // Animate line draw
        const pathLength = path.getTotalLength();
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;
        path.style.transition = "stroke-dashoffset 1.8s ease-in-out";
        setTimeout(() => {
            path.style.strokeDashoffset = "0";
        }, 100);

        // Tooltip
        const tooltip = document.createElement("div");
        tooltip.style.position = "absolute";
        tooltip.style.background = "#6366f1";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px 10px";
        tooltip.style.borderRadius = "5px";
        tooltip.style.fontSize = "14px";
        tooltip.style.display = "none";
        tooltip.style.pointerEvents = "none";
        tooltip.style.transform = "translate(-50%, -30px)";
        container.appendChild(tooltip);

        // Skip circles that are too close
        let lastX = -Infinity;
        points.forEach((point) => {
            const x = xScale(point.date);
            if (x - lastX < 12) return; // Minimum distance of 8px between points
            lastX = x;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", yScale(point.xp));
            circle.setAttribute("r", "6");
            circle.setAttribute("fill", "#6366f1");
            circle.style.cursor = "pointer";

            circle.addEventListener("mouseenter", (event) => {
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

    drawChart();
    window.addEventListener("resize", drawChart);
}


function renderPassFailPieChart(results, container) {
    function drawChart() {
        container.innerHTML = "";

        const passCount = results.filter((r) => r.grade === 1).length;
        const failCount = results.filter((r) => r.grade === 0).length;
        const total = passCount + failCount;

        if (total === 0) {
            container.innerHTML = "<p>No data available to display chart.</p>";
            return;
        }

        const width = container.clientWidth;
        const centerX = width / 2;
        const centerY = 150;
        const radius = Math.min(width, 300) / 3;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", 300);
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
            path.classList.add("pie-slice");

            setTimeout(() => {
                path.classList.add("animated");
            }, 100);

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

    drawChart();
    window.addEventListener("resize", drawChart);
}

export { renderXpProgressChart, renderPassFailPieChart };
