$("#registerForm").submit(function(event) {
    event.preventDefault();

    const password = $("#password").val();
    const confirmPassword = $("#confirmPassword").val();

    if (password !== confirmPassword) {
        $("#confirmPassword").addClass("is-invalid");
        return;
    } else {
        $("#confirmPassword").removeClass("is-invalid");
    }
});

 $("#confirmPassword").on("input", function() {
        const password = $("#password").val();
        const confirmPassword = $("#confirmPassword").val();

        if (password === confirmPassword) {
            $("#confirmPassword").removeClass("is-invalid");
        }   
 });