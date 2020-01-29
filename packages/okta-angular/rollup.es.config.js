import sourcemaps from 'rollup-plugin-sourcemaps';
import license from 'rollup-plugin-license';

const path = require('path');
const utilDir = path.resolve(__dirname, '..', '..', 'util');
export default {
    output: {
        format: 'es',
        sourcemap: true
    },
    plugins: [
        sourcemaps(),
        license({
            sourcemap: true,
            banner: {
                file: path.join(utilDir, 'license-template.txt'),
                encoding: 'utf-8',
            }
        })
    ],
    onwarn: () => { return }
}
