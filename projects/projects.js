import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const titleElement = document.querySelector('.projects-title');
titleElement.textContent = `${projects.length} Projects`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let query = '';
// let selectedIndex = -1;
let selectedYear = null;

let searchInput = document.querySelector('.searchBar');

// searchInput.addEventListener('change', (event) => {
//     query = event.target.value;

//     let filteredProjects = projects.filter((project) => {
//         let values = Object.values(project).join('\n').toLowerCase();
//         return values.includes(query.toLowerCase());
//     });
//     renderProjects(filteredProjects, projectsContainer, 'h2');
//     renderPieChart(filteredProjects);
// });

searchInput.addEventListener('change', (event) => {
    query = event.target.value;
    selectedYear = null;
    applyFilters();
});

let colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));

    let newSVG = d3.select('svg');
    newSVG.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    newArcs.forEach((arc, i) => {
        newSVG
            .append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .on('click', () => {
                // selectedIndex = selectedIndex === i ? -1 : i;
                selectedYear = selectedYear === newData[i].label ? null : newData[i].label;
                applyFilters();

                newSVG
                .selectAll('path')
                .attr('class', (_, idx) => (
                    idx === selectedIndex ? 'selected' : ''
                ));

                legend
                    .selectAll('li')
                    .attr('class', (_, idx) => (
                        idx === selectedIndex ? 'legend-item selected' : 'legend-item'
                    ));

                // if (selectedIndex === -1) {
                //     renderProjects(projects, projectsContainer, 'h2');
                // } else {
                //     let selectedYear = newData[selectedIndex].label;

                //     let filteredProjects = projects.filter((project) =>
                //         project.year === selectedYear
                //     );

                //     renderProjects(filteredProjects, projectsContainer, 'h2');
                // }
                applyFilters();
            });
    });

    // newData.forEach((d, idx) => {
    //     legend
    //         .append('li')
    //         .attr('style', `--color:${colors(idx)}`)
    //         .attr('class', 'legend-item')
    //         .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    // });

    newData.forEach((d, idx) => {
        legend
            .append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', d.label === selectedYear ? 'legend-item selected' : 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
     });
}

function applyFilters() {
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    if (selectedIndex !== -1) {
        let selectedYear = d3.rollups(
            filteredProjects,
            (v) => v.length,
            (d) => d.year,
        ).map(([year, count]) => {
            return { value: count, label: year };
        })[selectedIndex]?.label;

        filteredProjects = filteredProjects.filter((project) =>
            project.year === selectedYear
        );
    }

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
}

function applyFilters() {
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    if (selectedYear !== null) {
        filteredProjects = filteredProjects.filter((project) =>
            project.year === selectedYear
        );
    }

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
}

renderPieChart(projects);