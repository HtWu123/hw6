import { treemap, hierarchy, scaleOrdinal, schemeDark2, format } from "d3";

export function TreeMap(props) {
    const { margin, svg_width, svg_height, tree, selectedCell, setSelectedCell } = props;

    // 定义内部绘图区域大小
    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;

    // define a treemap using the d3.treemap();
    const root = hierarchy(tree).sum(d => d.children ? 0 : d.value);
    const layout = treemap()
        .size([innerWidth, innerHeight])
        .padding(2)
        .round(true)(root);

   //define the color map; you can use schemeDark2, a d3 build-in color scheme;
    const parentCategories = Array.from(new Set(layout.leaves().map(node => node.parent.data.name)));
    const color = scaleOrdinal(schemeDark2).domain(parentCategories);

    const topLevelGroups = root.children || [];

    // text
    const TreemapText = ({ node }) => {
        const { name, attr } = node.data;
        const percentage = format(".1%")(node.value / node.parent.value); // 计算所占比例
        return (
            <foreignObject width={node.x1 - node.x0} height={node.y1 - node.y0} style={{ pointerEvents: 'none' }}>
                <div style={{ color: 'white', fontSize: '13px', lineHeight: '1.2', padding: '2px' }}>
                    <div>{attr}: {name}</div>
                    <div>value: {percentage}</div>
                </div>
            </foreignObject>
        );
    };

    const isSelected = (ancestors) => {
        if (!selectedCell) return false;
        return selectedCell.every((item, idx) => item.name === ancestors[idx].name && item.attr === ancestors[idx].attr);
    };

    return (
        <svg width={svg_width} height={svg_height}>
            <g transform="translate(10, 0)">
                {parentCategories.map((category, i) => (
                    <g key={category} transform={`translate(${i * 150}, 0)`}>
                        <rect width={20} height={20} fill={color(category)} />
                        <text x={25} y={15} fontSize="12px">
                            {`${layout.leaves()[0].parent.data.attr}: ${category}`}
                        </text>
                    </g>
                ))}
            </g>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
                {layout.leaves().map((node, idx) => {
                    const ancestors = node.ancestors()
                        .map(n => ({ name: n.data.name, attr: n.data.attr }))
                        .slice(0, -1); 

                    return (
                        <g key={`cell-${idx}`} transform={`translate(${node.x0}, ${node.y0})`}
                            onMouseOver={() => setSelectedCell(ancestors)}
                            onMouseOut={() => setSelectedCell(null)}
                        >
                            <rect
                                width={node.x1 - node.x0}
                                height={node.y1 - node.y0}
                                fill={isSelected(ancestors) ? "red" : color(node.parent.data.name)}
                                stroke="none"
                                opacity={0.8}
                            />
                            <TreemapText node={node} />
                        </g>
                    );
                })}

                {topLevelGroups.map((group, idx) => (
                    <g key={`group-${idx}`} transform={`translate(${group.x0}, ${group.y0})`}>
                        <rect
                            width={group.x1 - group.x0}
                            height={group.y1 - group.y0}
                            stroke="black"
                            fill="none"
                        />
                        <text
                            x={(group.x1 - group.x0) / 2}
                            y={(group.y1 - group.y0) / 2}
                            fontSize="2.5em"
                            fontWeight="bold"
                            textAnchor="middle"
                            opacity={0.3}
                            transform={`rotate(${(group.x1 - group.x0) > (group.y1 - group.y0) ? 0 : 90}, ${(group.x1 - group.x0) / 2}, ${(group.y1 - group.y0) / 2})`}
                        >
                            {group.data.attr}: {group.data.name}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    );
}
