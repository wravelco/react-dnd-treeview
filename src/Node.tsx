import React, {
  useEffect,
  useRef,
  useContext,
  PropsWithChildren,
  ReactElement,
} from "react";
import { getEmptyImage } from "react-dnd-html5-backend";
import { Container } from "./Container";
import {
  useTreeContext,
  useDragNode,
  useDropNode,
  useDragControl,
} from "./hooks";
import { PlaceholderContext } from "./providers";
import { NodeModel, RenderParams } from "./types";
import { isDroppable } from "./utils";

type Props = PropsWithChildren<{
  id: NodeModel["id"];
  depth: number;
}>;

export const Node = <T,>(props: Props): ReactElement | null => {
  const treeContext = useTreeContext<T>();
  const placeholderContext = useContext(PlaceholderContext);
  const containerRef = useRef<HTMLElement>(null);
  const handleRef = useRef<any>(null);
  const item = treeContext.tree.find(
    (node) => node.id === props.id
  ) as NodeModel<T>;
  const { openIds, classes } = treeContext;
  const open = openIds.includes(props.id);

  const [isDragging, drag, preview] = useDragNode(item, containerRef);
  const [isOver, dragSource, drop] = useDropNode(item, containerRef);

  useEffect(() => {
    if (handleRef.current) {
      drag(handleRef);
      preview(containerRef);
    } else {
      drag(containerRef);
    }
  }, []);

  if (isDroppable(dragSource?.id, props.id, treeContext)) {
    drop(containerRef);
  }

  const hasChild = !!treeContext.tree.find((node) => node.parent === props.id);

  useEffect(() => {
    if (treeContext.dragPreviewRender) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview, treeContext.dragPreviewRender]);

  useDragControl(containerRef);

  const handleToggle = () => treeContext.onToggle(item.id);

  const Component = treeContext.listItemComponent;

  let className = classes?.listItem || "";

  if (isOver && classes?.dropTarget) {
    className = `${className} ${classes.dropTarget}`;
  }

  if (isDragging && classes?.draggingSource) {
    className = `${className} ${classes.draggingSource}`;
  }

  const draggable = treeContext.canDrag ? treeContext.canDrag(props.id) : true;
  const isDropTarget = placeholderContext.dropTargetId === props.id;

  const params: RenderParams = {
    depth: props.depth,
    isOpen: open,
    isDragging,
    isDropTarget,
    draggable,
    hasChild,
    containerRef,
    handleRef,
    onToggle: handleToggle,
  };

  return (
    <Component ref={containerRef} className={className} role="listitem">
      {treeContext.render(item, params)}
      {open && hasChild && (
        <Container parentId={props.id} depth={props.depth + 1} />
      )}
    </Component>
  );
};
