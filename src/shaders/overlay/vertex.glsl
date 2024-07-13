varying vec2 v;

void main()
{
   v = uv;
   gl_Position = vec4(position, 1.0);
}