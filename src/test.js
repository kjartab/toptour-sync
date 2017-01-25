
Promise.resolve()
.then(function() {
    console.log("recursion");
    return (3);
})
.then(
    function recursiveFunction(n) {

        if (n == 0) {
            return;
        }

        var promise = Promise.resolve().then(
            function() {
                console.log(n);
                return (recursiveFunction(n - 1));
            }
        );

        return promise;

    }
);