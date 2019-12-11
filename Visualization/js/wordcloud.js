var sizes = [];
d3.csv("data/unigram.csv", function(data){
    console.log(data);
    var words = [];
    data.forEach(function(d){
        words.push(d.word);
        if(filtered_words.includes(d.word)){
            sizes.push(parseInt(d.count));
        }
    });
    console.log(words);
    console.log(sizes);
    createCloud();
});

filtered_words = ["we", "great", "place","stay", "location", "apartment", "clean", "nice", "room", "boston", "easy", "everything", "close", "good", "us", "recommend", "really", "definitely", "walk", "perfect", "comfortable", "house", "host", "well", "super", "time", "clean,", "highly", "space", "they", "home", "staying", "walking", "like", "made", "check", "wonderful", "quiet", "again", "back", "even", "bed"]

function createCloud(){
    var layout = d3.layout.cloud()
        .size([800, 500])
        .words(filtered_words.map(function(d,i) {
            return {text: d, size: 10 + sizes[i]/1500, test: "haha"};
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

}
