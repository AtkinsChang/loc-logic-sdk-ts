(function () {
    'use strict';

    Object.assign(globalThis, {
        async run(ctx) {
            ctx.agents.result.finalize({
                result: 16 - 9,
            });
        },
        async handleError(ctx, error) {
            ctx.agents.logging.error(`${error}`);
        },
    });

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWRlcHJlY2F0ZWQuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXN1bHQtZGVwcmVjYXRlZC50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFQSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtRQUN4QixNQUFNLEdBQUcsQ0FBQyxHQUFzQjtZQUM5QixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQ3pCLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQzthQUNmLENBQUMsQ0FBQztTQUNKO1FBQ0QsTUFBTSxXQUFXLENBQUMsR0FBc0IsRUFBRSxLQUFtQjtZQUMzRCxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3RDO0tBQ0YsQ0FBQzs7Ozs7OyJ9
