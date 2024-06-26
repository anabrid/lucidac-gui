<!--
Copyright (c) 2024 anabrid GmbH
Contact: https://www.anabrid.com/licensing/
SPDX-License-Identifier: MIT OR GPL-2.0-or-later
-->
<script lang="ts">
   import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
   import { faLeftRight } from '@fortawesome/free-solid-svg-icons'

    import { type NodeData } from './Store';
    import { Handle, Position, type NodeProps, useUpdateNodeInternals } from "@xyflow/svelte";
    import { AssignedElement } from "@/lucicon/types";

    type $$Props = NodeProps<NodeData>;

    export let id: $$Props['id']; id;
    export let data: $$Props['data']; data;
    export let dragHandle: $$Props['dragHandle'] = undefined; dragHandle;
    export let type: $$Props['type']  = undefined; type;
    export let selected: $$Props['selected'] = undefined; selected;
    export let isConnectable: $$Props['isConnectable'] = undefined; isConnectable;
    export let zIndex: $$Props['zIndex'] = undefined; zIndex;
    export let width: $$Props['width'] = undefined; width;
    export let height: $$Props['height'] = undefined; height;
    export let dragging: $$Props['dragging']; dragging;
    export let targetPosition: $$Props['targetPosition'] = undefined; targetPosition;
    export let sourcePosition: $$Props['sourcePosition'] = undefined; sourcePosition;

//    export let data: $$Props["data"] = { rtl: false }

    const updateNodeInternals = useUpdateNodeInternals();

    const logicalElement = AssignedElement.fromString(id);
    const desc = logicalElement.type()

    $: {
        if(!data) data = {}
        if(!("rtl" in data)) data.rtl = false
        data = data
        updateNodeInternals(id)
    }

    // TODO: Mark invalid elements, ie. not mappable on physical elements
    const valid = true
</script>

<div class="node" class:rtl={data.rtl} class:ltr={!data.rtl} class:invalid={!valid} class:selected={selected}>
    {#if desc.name == "Pot"}
        <div class="round-node-box">
            <div>
                {#if selected}
                    <input type="number" class="hide_spin" bind:value={data.coeff}
                        on:focus={()=> setTimeout(()=>selected=true, 0)}>
                {:else}
                    {#if data.coeff !== undefined && data.coeff !== null}
                        {data.coeff}
                    {/if}
                {/if}
            </div>
        </div>
        <div>
            <Handle type="target" position={data.rtl ? Position.Right : Position.Left} id="in" {isConnectable} />
            <Handle type="source" position={data.rtl ? Position.Left : Position.Right}  id="out" {isConnectable} />
        </div>
    {:else}
    <div class="node-box">
        <div class="input-handles">
            {#if desc.inputs.length == 2}
            <Handle
                type="target"
                position={data.rtl ? Position.Right : Position.Left}
                id="a"
                style="top: 30%"
                {isConnectable}
            />
            <Handle
                type="target"
                position={data.rtl ? Position.Right : Position.Left}
                id="b"
                style="top: 70%"
                {isConnectable}
            />
            {#if selected}
            <span>&sum;</span>
            <span>&sum;</span>
            {/if}
            {:else if desc.inputs.length == 1}
            <Handle
                type="target"
                position={data.rtl ? Position.Right : Position.Left}
                id="in"
                style="top: 50%"
                {isConnectable}
            />
            {#if selected}
            <span>&sum;</span>
            {/if}
            {/if}
        </div>
        <div class="node-label">
            {#if desc.name == "Int"}
            <img src="latex-int.svg">
            {:else if desc.name == "Mul"}
            <img src="latex-mul.svg">
            {:else}
            <i>{ desc.name }</i>
            {/if}
            {#if !selected}
            <sub>
                {#if selected}
                {:else}
                    {logicalElement.id}
                {/if}
            </sub>
            {/if}
        </div>
        {#if selected}
        <table>
            {#if desc.name == "Int"}
            <tr>
                <td>ic=</td>
                <td><input type="number" class="hide_spin" bind:value={data.ic}></td>
            </tr>
            <tr>
                <td>k<sub>0</sub>=</td>
                <td><input type="number" class="hide_spin" bind:value={data.k}></td>
            </tr>
            {:else if desc.name == "Pot"}
            <!-- unreachable branch, Pot now displayed differently -->
            <tr>
                <td>coeff=</td>
                <td><input value="1"></td>
            </tr>
            {/if}
            <tr>
                <td>id=</td>
                <td><input type="number" class="hide_spin" bind:value={logicalElement.id}></td>
            </tr>
        </table>
        {/if}
    </div>
    <div class="caret">
        <svg viewBox="0 0 10 10" preserveAspectRatio="none">
            <path d="M 0,10 10,5 0,0" vector-effect="non-scaling-stroke" />
        </svg>
    </div>
    {#if desc.outputs.length == 1 }
    <Handle type="source" position={data.rtl ? Position.Left : Position.Right} id="out" {isConnectable} />
    {/if}
    {/if} <!-- end of if Pot -->
    {#if selected}
        <button class="button is-small" name="swap" on:click={()=> data.rtl = !data.rtl}>
            <span class="icon is-small"><FontAwesomeIcon icon={faLeftRight} /></span>
            <span>Mirror</span>
        </button>
    {:else}
        {#if desc.name == "Int" && data && data.ic}
        <div class="above-panel">
            {data.ic}
        </div>
        {/if}
    {/if}

</div>

<!--

    note: Can move SVG implementation to central place with

<svg class="defs-only" xmlns="http://www.w3.org/2000/svg">
  ....
  <symbol id="rainbow">
    <rect height="100%" width="100%" fill="url(#sky)"/>
    <ellipse cx="50%" cy="120%" rx="50%" ry="110%" fill="url(#rainbow-grad)" />
  </symbol>
</svg>
<figure>
  <figcaption>50x25</figcaption>
  <div>
    <svg width="50" height="25">
      <use xlink:href="#rainbow"/>
    </svg>


-->
<style lang="scss">
    $node-height: 2.5em;
    $border-size: 1px;
    $border-color: #1a192b;

    .node {
        display: flex;
        flex-direction: row;
        &.rtl { flex-direction: row-reverse; }


        height: $node-height;

        &.ltr {
            border-right: 0;
        }
     }

    .node-box {
        flex-grow: 2;
        flex-direction: row;

        .ltr & { border-right: none; }
        .rtl & { border-left:  none; }
    }

    .node-box, .round-node-box {
        display: flex;
        border: $border-size solid $border-color;
        background-color: white;

        .selected & {
            background-color: #eff0ff;
        }
    }

    .round-node-box { // potentiometers
        width: $node-height;
        height: $node-height;
        border: $border-size solid $border-color;
        border-radius: calc($node-height/2);

        justify-content: center;
        align-items: center;

        input {
            width: 2em;
            text-align: center;
            background-color: transparent;
        }
    }

    .node-label {
        align-self: center
    }

    .caret {
        flex-grow: 0;
        svg {
            width: .9em;
            height: $node-height;

            fill: white;
            stroke: $border-color;
            stroke-width: $border-size;
            paint-order: fill markers stroke;

            .rtl & { transform: scale(-1,1) }
        }

        .selected & svg {
            fill: #eff0ff;
        }
    }

    .input-handles {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 70%;
        text-align: center;
        width: 1em;

        .rtl & { order: 3 }
    }

    table {
        border-left: $border-size solid $border-color;
        border-right: $border-size solid $border-color;

        font-size: 50%;
        td, th {
            padding: 0
        }
    }

    input:not([type="checkbox"]) {
        width: 3em;
        font-size: 80%;
        padding: 0;
        border: none
    }

    button[name="swap"] {
        position: absolute;
        top: -44%;
        left: 24%;
        font-size: 40%;
    }

    .above-panel {
        $above-panel-height: 12px;

        position: absolute;
        top: calc(-1.0 * $above-panel-height + 1px);
        left: 0;
        height: $above-panel-height;
        font-size: 50%;

        border: $border-size solid $border-color;
        border-bottom: none;
    }



    .invalid {
        color: red;
        border-color: red;
    }
</style>
