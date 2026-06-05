# SteelMotion

SteelMotion is a steel-industry video generation studio forked from `headline-design/seq`.

It turns an industry template into a storyboard flow, routes scenes through a swappable video provider, records generation state and cost, and keeps the resulting clips editable on a timeline.

## Steel Industry Templates

Built-in templates:

- Automotive
- Water pipe
- Construction
- Home appliance
- Engineering machinery

Default storyboard prompt flow:

```text
材料 -> 加工 -> 产品应用 -> 部件高亮 -> 品牌收束
```

## Data Model

SteelMotion adds first-class project objects:

- `Project`
- `Asset`
- `Scene`
- `Generation`
- `Provider`
- `CostLog`

The model definitions live in `seq/lib/steelmotion/types.ts`.

## Video Providers

Provider abstraction:

```ts
generateVideo(scene, provider)
```

Current adapters:

- `vidu` using `VIDU_API_KEY`
- `fal` kept as a compatibility provider for the original Seq models

Supported task states:

- `queued`
- `running`
- `succeeded`
- `failed`
- `retrying`

Clip screening:

- `keep`
- `retry`
- `discard`

## Cost Tracking

Each generation can record:

- elapsed time
- provider
- model
- cost amount and currency
- failure count
- final status

## Export Templates

Built-in export templates cover:

- opener
- closer
- logo placement
- watermark
- subtitles

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment

```bash
VIDU_API_KEY=...
VIDU_BASE_URL=https://api.vidu.cn/ent/v2
FAL_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

`VIDU_API_KEY` is the default video provider credential. `FAL_KEY` is optional unless using the fal compatibility models.
