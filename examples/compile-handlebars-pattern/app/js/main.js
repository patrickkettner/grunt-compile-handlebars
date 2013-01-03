require(["js/foo"], function(foo) {
    $(function() {
        console.log("Require is working as expected");
        foo();
    });
});
