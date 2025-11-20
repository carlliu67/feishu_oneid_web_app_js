function openSchema(url, closePage = false) {
    window.h5sdk.ready(() => {
        console.log("window.h5sdk.ready");
        window.tt.openSchema({
            schema: url,
            external: true,
            success(res) {
                console.log(JSON.stringify(res));
            },
            fail(res) {
                console.log(`openSchema fail: ${JSON.stringify(res)}`);
            }
        });
        if (closePage) {
            setTimeout(() => {
                window.tt.closeWindow({
                    fail(res) {
                      console.log(`closeWindow fail: ${JSON.stringify(res)}`);
                    }
                });
            }, 30000);
        }
    });
}

export { openSchema }