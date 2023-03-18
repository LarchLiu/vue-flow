import type { MaybeRef } from '@vueuse/core'
import type { GraphNode } from '~/types'

/**
 * Get a node with the given id, it's parent (if one exists) and connected edges
 *
 * If no node id is provided, the node id is injected from context,
 * meaning if you do not provide an id, this composable has to be called in a child of your custom node component, or it will throw!
 */
export default function useNode<T extends GraphNode = GraphNode>(id?: MaybeRef<string>) {
  const { findNode, edges, emits } = useVueFlow()

  const nodeIdInjection = inject(NodeId, '')

  const nodeId = computed(() => {
    const nextId = unref(id) ?? nodeIdInjection

    if (!nextId || nextId === '') {
      throw new VueFlowError(`No node id provided and no injection could be found!`, 'useNode')
    }

    return nextId
  })

  const nodeRef = inject(NodeRef, null)

  const nodeEl = computed(() => unref(nodeRef) ?? document.querySelector(`[data-id="${nodeId.value}"]`))

  const node = computed(() => {
    const nextNode = findNode<T>(nodeId.value)

    if (!nextNode) {
      throw new VueFlowError(`Node with id ${nodeId.value} not found!`, 'useNode')
    }

    return nextNode
  })

  const parentNode = computed(() => findNode(node.value.parentNode))

  const connectedEdges = computed(() => getConnectedEdges([node.value], edges.value))

  return {
    id: nodeId,
    nodeEl,
    node,
    parentNode,
    connectedEdges,
  }
}
