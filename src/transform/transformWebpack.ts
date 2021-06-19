import { parseWebpackConfig } from '../config/parse'
import { RawValue, ViteConfig } from '../config/vite'
import { TransformContext } from './context'
import { initViteConfig, Transformer } from './transformer'
import path from 'path'
import { DEFAULT_VUE_VERSION } from '../constants/constants'

// convert webpack.config.js => vite.config.js
export class WebpackTransformer implements Transformer {
    context : TransformContext = {
      vueVersion: DEFAULT_VUE_VERSION,
      config: initViteConfig(),
      importList: []
    }

    public async transform (rootDir: string): Promise<ViteConfig> {
      const webpackConfig = await parseWebpackConfig(path.resolve(rootDir, 'webpack.config.js'))
      const config = this.context.config

      // convert base config
      // TODO: convert entry
      // webpack may have multiple entry files, e.g.
      // 1. one entry, with one entry file : e.g. entry: './app/index.js'
      // 2. one entry, with multiple entry files: e.g. entry: ['./pc/index.js','./wap/index.js']
      // 3. multiple entries e.g. entry: {
      //      wap: './pc/index.js',
      //      pc: './wap/index.js'
      // }
      config.mode = webpackConfig.mode

      const defaultAlias = []

      const alias = {
        '@': `${rootDir}/src`
      }
      Object.keys(alias).forEach((key) => {
        const relativePath = path.relative(rootDir, alias[key]).replace(/\\/g, '/')
        defaultAlias.push({
          find: key,
          replacement: new RawValue(`path.resolve(__dirname,'${relativePath}')`)
        })
      })

      config.resolve = {}
      config.resolve.alias = defaultAlias

      return null
    }
}
