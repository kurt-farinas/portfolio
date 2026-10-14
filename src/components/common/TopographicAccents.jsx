import React from 'react';

const contours = [
  'M111 8 C151 5 184 22 196 51 C209 82 193 117 198 145 C203 174 183 205 151 211 C117 218 93 198 62 207 C31 216 8 193 10 163 C12 132 -3 107 10 78 C23 49 41 15 75 12 C88 11 99 9 111 8Z',
  'M112 19 C143 16 174 31 184 56 C195 82 181 111 186 143 C191 169 172 192 147 198 C116 205 94 187 64 196 C39 203 19 185 20 160 C22 131 8 106 21 81 C33 57 48 26 77 23 C89 22 101 20 112 19Z',
  'M112 31 C139 28 163 41 172 62 C182 85 170 110 175 140 C180 163 163 181 142 187 C116 193 94 178 68 185 C46 191 31 176 31 157 C32 131 20 107 32 84 C43 63 56 38 81 35 C92 34 102 32 112 31Z',
  'M113 43 C134 40 153 51 162 69 C171 89 160 111 165 137 C169 156 155 170 138 176 C116 181 96 169 72 175 C54 180 43 168 43 153 C44 131 32 108 43 88 C52 70 64 50 85 47 C94 46 104 44 113 43Z',
  'M114 56 C131 53 145 62 152 77 C160 94 150 112 155 134 C158 150 147 160 133 165 C115 170 97 159 77 165 C62 169 54 160 55 149 C56 130 45 109 54 92 C63 77 72 63 89 60 C98 59 106 57 114 56Z',
  'M114 69 C127 67 138 74 144 86 C150 100 141 114 145 132 C148 144 139 151 128 155 C114 159 99 150 82 154 C70 157 66 151 67 144 C68 128 57 109 66 96 C73 84 81 75 94 73 C101 72 108 70 114 69Z',
  'M115 83 C124 81 131 87 136 97 C141 108 133 117 137 131 C139 139 132 143 124 146 C113 149 101 141 88 144 C80 146 78 142 79 137 C80 125 69 109 77 100 C83 91 89 87 99 86 C105 85 110 84 115 83Z'
];

export function ContourCluster({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 220 220" fill="none" aria-hidden="true" focusable="false">
      {contours.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
}

export default function TopographicAccents() {
  return (
    <div className="studio-topography" aria-hidden="true">
      <ContourCluster className="studio-topography-cluster studio-topography-cluster-top" />
      <ContourCluster className="studio-topography-cluster studio-topography-cluster-bottom" />
    </div>
  );
}
