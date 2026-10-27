declare module 'react' {
    import * as React from 'react';
    export = React;
    export as namespace React;
}

declare module 'react/jsx-runtime' {
    const content: any;
    export = content;
}
