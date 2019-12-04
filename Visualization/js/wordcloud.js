var layout = d3.layout.cloud()
    .size([500, 500])
    .words([
        "Hello", "world", "normally", "you", "want", "more", "words",
        "than", "th" + "is"].map(function(d) {
        return {text: d, size: 10 + Math.random() * 90, test: "haha"};
    }))
    .padding(5)
    // set angles
    .rotate(function() { return ~~(Math.random() * 6-3) * 30; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", draw);

layout.start();

function draw(words) {
    d3.select("#wordcloud").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        // set color here
        .attr("fill", function(d,i){return ["lightcoral","darkcyan","#ffe8a1"][i%3]});
}
